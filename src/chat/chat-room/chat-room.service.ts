import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {UpdateRoomDto} from './dto/update-room.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {DataSource, In, QueryRunner, Repository} from "typeorm";
import {User} from "../../user/entities/user.entity";
import {CreateChatRoomDto} from "./dto/create-chat-room.dto";
import {ChatRoom} from "./entities/chat-room.entity";
import {ChatCursor} from "../cursor/entities/chat-cursor.entity";
import {ChatMessage, MessageType} from "../messages/entities/chat-message.entity";
import {GetChatRoomsDto} from "./dto/get-chat-rooms.dto";
import {CommonService} from "../../common/common.service";
import {AddMembersDto} from "./dto/add-members.dto";
import {Department} from "../../department/entities/department.entity";

@Injectable()
export class ChatRoomService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(ChatRoom)
        private readonly chatRoomRepository: Repository<ChatRoom>,
        @InjectRepository(ChatCursor)
        private readonly cursorRepository: Repository<ChatCursor>,
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
        private readonly commonService: CommonService,
        private readonly dataSource: DataSource,
    ) {
    }

    async findUser(mbNo: number) {
        const user = await this.userRepository.findOne({where: {mbNo}})
        if (!user) throw new NotFoundException("사용자를 찾을 수 없습니다.");

        return user;
    }

    async create(
        createChatRoomDto: CreateChatRoomDto,
        mbNo: number,
        qr: QueryRunner,
    ) {
        const user = await this.findUser(mbNo);

        // 1) 팀 정보 + 팀 멤버 조회
        const teams = await this.departmentRepository.find({
            where: {
                id: In(createChatRoomDto.teamNos ?? []),
            },
            relations: ['members'],
        });

        // JS/TS에서는 expand 대신 flatMap 또는 reduce 사용
        // 방법 1: flatMap (Node 12+ / TS 타깃 modern이면 사용 가능)
        const teamMembers: User[] = teams.flatMap((t) => t.members ?? []);

        // 방법 2: flatMap 지원 안 되는 환경이면 reduce 사용
        // const teamMembers: User[] = teams.reduce<User[]>((acc, t) => {
        //   if (t.members?.length) acc.push(...t.members);
        //   return acc;
        // }, []);

        // 2) 개별 선택 멤버 조회
        const explicitMembers = await qr.manager.find(User, {
            where: {
                mbNo: In(createChatRoomDto.memberNos ?? []),
            },
        });

        if (explicitMembers.length !== (createChatRoomDto.memberNos?.length ?? 0)) {
            throw new NotFoundException('존재하지 않는 사용자가 있습니다.');
        }

        // 3) 방 생성자 + 팀 멤버 + 개별 멤버를 모두 합치고,
        //    mbNo 기준으로 중복 제거
        const memberMap = new Map<number, User>();

        const addMember = (m?: User) => {
            if (!m) return;
            if (!m.mbNo) return;
            memberMap.set(m.mbNo, m);
        };

        teamMembers.forEach(addMember);
        explicitMembers.forEach(addMember);
        addMember(user); // 생성자 본인 추가

        const allMembers = Array.from(memberMap.values());

        if (allMembers.length === 0) {
            throw new BadRequestException('채팅방에 추가할 멤버가 없습니다.');
        }

        // 4) 채팅방 생성
        const room = await qr.manager
            .createQueryBuilder()
            .insert()
            .into(ChatRoom)
            .values({
                name: createChatRoomDto.name,
            })
            .execute();

        const roomId = room.identifiers[0].id;

        // 5) 방-멤버 관계 추가
        await qr.manager
            .createQueryBuilder()
            .relation(ChatRoom, 'members')
            .of(roomId)
            .add(allMembers.map((m) => m.mbNo));

        // 6) 각 멤버에 대해 커서 생성
        await qr.manager
            .createQueryBuilder()
            .insert()
            .into(ChatCursor)
            .values(
                allMembers.map((m) => ({
                    roomId,
                    mbNo: m.mbNo,
                    roomNickName: createChatRoomDto.name,
                    lastReadMessageId: null,
                    lastReadAt: null,
                })),
            )
            .execute();

        // 7) 방 생성 시스템 메시지
        await qr.manager
            .createQueryBuilder()
            .insert()
            .into(ChatMessage)
            .values({
                room: roomId,
                type: MessageType.SYSTEM,
                content: `'${createChatRoomDto.name}' 채팅방이 생성되었습니다.`,
            })
            .execute();

        const model = await qr.manager.findOne(ChatRoom, {
            where: { id: roomId },
        });

        return model?.id;
    }

    async findMyRooms(mbNo: number, dto: GetChatRoomsDto) {
        const user = await this.findUser(mbNo);
        const {name} = dto;
        const qb = this.cursorRepository
            .createQueryBuilder('cursor')
            .leftJoinAndSelect('cursor.room', 'room')

        if (name) {
            qb.where('cursor.roomNickName LIKE :name', {name: `%${name}%`});
        }

        qb.andWhere('cursor.mbNo = :mbNo', {mbNo: user.mbNo});

        const {nextCursor} = await this.commonService.applyCursorPaginationParamsToQb(qb, dto);
        const [cursors, count] = await qb.getManyAndCount();

        if (cursors.length === 0) {
            return {
                data: [],
                meta: {nextCursor, count},
            };
        }

        // 1) 방 전체 로드 (멤버 + 메시지까지)
        const roomIds = cursors.map((c) => c.roomId);
        const rooms = await this.chatRoomRepository.find({
            where: {id: In(roomIds)},
            relations: ['members', 'messages'], // ★ messages 반드시 포함
        });

        const roomsById = new Map(rooms.map((r) => [r.id, r]));


        // 2) 커서 기준으로 unread 계산 + 요약 DTO 생성
        const fixedData = cursors.map((cursor) => {
            const room = roomsById.get(cursor.roomId);
            if (!room) {
                return {
                    roomId: cursor.roomId,
                    name: cursor.roomNickName ?? '',
                    memberCount: 0,
                    newMessageCount: 0,
                };
            }

            const messages = room.messages ?? [];
            const lastReadMessageId = cursor.lastReadId ?? 0;

            const unreadCount = messages.reduce((acc, m) => {
                // ChatMessage 의 PK 필드명에 맞게 수정 (예: m.id)
                return acc + (m.id > lastReadMessageId ? 1 : 0);
            }, 0);

            return {
                roomId: room.id,
                name: cursor.roomNickName ?? room.name ?? '',
                memberCount: room.members?.length ?? 0,
                newMessageCount: unreadCount,
            };
        });

        return {
            data: fixedData,
            meta: {nextCursor, count},
        };
    }


    async findOne(roomId: number, mbNo: number) {
        const user = await this.findUser(mbNo);

        // 1) 커서 확인 (내가 이 방 멤버인지 검증)
        const cursor = await this.cursorRepository.findOne({
            where: {
                mbNo: user.mbNo,
                roomId,
            },
        });

        if (!cursor) {
            throw new BadRequestException('잘못된 요청입니다.');
        }

        // 2) 방 + 멤버 + 메시지 조회
        const room = await this.chatRoomRepository.findOne({
            where: {id: roomId},
            relations: ['members', 'messages', 'members.deptSite'],
        });

        if (!room) {
            throw new NotFoundException('채팅방을 찾을 수 없습니다.');
        }

        const messages = room.messages ?? [];
        const lastReadMessageId = cursor.lastReadId ?? 0;

        // 3) unread 재계산
        const unreadCount = messages.reduce((acc, m) => {
            return acc + (m.id > lastReadMessageId ? 1 : 0);
        }, 0);

        // 4) 읽음 커서 업데이트 (마지막 메시지 기준)
        const lastMessage = messages[messages.length - 1];
        if (lastMessage) {
            await this.cursorRepository.update(
                {roomId: cursor.roomId, mbNo: cursor.mbNo},
                {
                    lastReadId: lastMessage.id,
                },
            );
        }

        // 5) 공통 요약 구조
        const summary = {
            roomId: room.id,
            name: cursor.roomNickName ?? room.name ?? '',
            memberCount: room.members?.length ?? 0,
            newMessageCount: unreadCount,
        };

        // 6) 상세 멤버 목록
        const members = room.members.map((m) => ({
            mbNo: m.mbNo,
            name: m.mbName ?? '',
            department: m.deptSite?.name ?? '',
            registerNum: m.registerNum ?? '',
            mb5: m.mb5 ?? '',
            mb2: m.mb2 ?? '',
        }));

        return {
            ...summary,
            members,
        };
    }

    async update(id: string, dto: UpdateRoomDto, mbNo: number) {
        const roomId = Number(id);

        // 1) 내가 이 방 멤버인지 확인 (cursor 기준)
        const cursor = await this.cursorRepository.findOne({
            where: {
                mbNo,
                roomId,
            },
        });

        if (!cursor) {
            throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
        }

        // 2) 방 + 기존 멤버 로드
        const room = await this.chatRoomRepository.findOne({
            where: { id: roomId },
            relations: ['members'],
        });

        if (!room) {
            throw new NotFoundException('채팅방을 찾을 수 없습니다.');
        }

        // ─────────────────────────
        // A. 방 이름 수정: 방 이름은 그대로 두고,
        //    "내 커서 별칭(roomNickName)"만 변경
        // ─────────────────────────
        if (dto.name) {
            cursor.roomNickName = dto.name;
            await this.cursorRepository.save(cursor);

            // 만약 실제 ChatRoom.name도 같이 바꾸고 싶으면 아래 주석 해제
            // room.name = dto.name;
            // await this.chatRoomRepository.save(room);
        }

        // ─────────────────────────
        // B. 멤버 추가 (팀 + 개별), 중복 제거
        // ─────────────────────────
        const hasMemberNos = (dto.memberNos?.length ?? 0) > 0;
        const hasTeamNos = (dto.teamNos?.length ?? 0) > 0;

        if (hasMemberNos || hasTeamNos) {
            // 1) 팀 멤버 조회
            const teams = await this.departmentRepository.find({
                where: {
                    id: In(dto.teamNos ?? []),
                },
                relations: ['members'],
            });

            const teamMembers: User[] = teams.flatMap((t) => t.members ?? []);

            // 2) 개별 멤버 조회
            const explicitMembers = await this.userRepository.find({
                where: {
                    mbNo: In(dto.memberNos ?? []),
                },
            });

            if (explicitMembers.length !== (dto.memberNos?.length ?? 0)) {
                const foundSet = new Set(explicitMembers.map((u) => u.mbNo));
                const missing = (dto.memberNos ?? []).filter(
                    (n) => !foundSet.has(n),
                );
                throw new NotFoundException(
                    `존재하지 않는 사용자가 있습니다: ${missing.join(', ')}`,
                );
            }

            // 3) 팀 멤버 + 개별 멤버 + (원하면 방 생성자/요청자 mbNo도) 합치고,
            //    mbNo 기준으로 중복 제거
            const memberMap = new Map<number, User>();

            const addMember = (m?: User) => {
                if (!m) return;
                if (!m.mbNo) return;
                memberMap.set(m.mbNo, m); // 같은 mbNo 들어오면 덮어쓰기 → 자동 dedupe
            };

            teamMembers.forEach(addMember);
            explicitMembers.forEach(addMember);

            // 4) 이미 방에 있는 멤버는 제외
            const existingNos = new Set(room.members.map((m) => m.mbNo));
            const newUsers = Array.from(memberMap.values()).filter(
                (u) => !existingNos.has(u.mbNo),
            );

            if (newUsers.length > 0) {
                // 5) ChatRoom.members 관계 추가
                await this.chatRoomRepository
                    .createQueryBuilder()
                    .relation(ChatRoom, 'members')
                    .of(roomId)
                    .add(newUsers.map((u) => u.mbNo));

                // 6) ChatCursor 에도 추가
                const nicknameBase =
                    dto.name ?? cursor.roomNickName ?? room.name ?? '';

                await this.cursorRepository
                    .createQueryBuilder()
                    .insert()
                    .values(
                        newUsers.map((u) => ({
                            roomId,
                            mbNo: u.mbNo,
                            roomNickName: nicknameBase,
                            lastReadMessageId: null,
                            lastReadAt: null,
                        })),
                    )
                    .execute();
            }
        }

        // ─────────────────────────
        // C. 최종 방 정보 리턴 (멤버 포함)
        // ─────────────────────────
        const updated = await this.chatRoomRepository.findOne({
            where: { id: roomId },
            relations: ['members'],
        });

        return updated;
    }

    async remove(id: number, mbNo: number) {
        const user = await this.findUser(mbNo);
        const room = await this.cursorRepository.findOne({
            where: {
                roomId: id,
                mbNo: user.mbNo,
            }
        });

        // 커서도 모두 삭제,
        if (!room) throw new NotFoundException('방을 찾을 수 없습니다.');

        await this.cursorRepository.softDelete({room});
        return id;
    }
}
