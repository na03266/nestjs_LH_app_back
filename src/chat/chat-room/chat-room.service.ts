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
        @InjectRepository(ChatMessage)
        private readonly messageRepository: Repository<ChatMessage>,
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
            where: {id: roomId},
        });

        return model?.id;
    }

    async findMyRooms(mbNo: number, dto: GetChatRoomsDto) {
        const user = await this.findUser(mbNo);
        const { name } = dto;

        const qb = this.cursorRepository
            .createQueryBuilder('cursor')
            .leftJoinAndSelect('cursor.room', 'room')
            .where('cursor.deletedAt IS NULL')
            .andWhere('cursor.mbNo = :mbNo', { mbNo: user.mbNo });

        if (name) {
            qb.andWhere('cursor.roomNickName LIKE :name', { name: `%${name}%` });
        }

        const { nextCursor } = await this.commonService.applyCursorPaginationParamsToQb(qb, dto);
        const [cursors, count] = await qb.getManyAndCount();

        if (cursors.length === 0) {
            return { data: [], meta: { nextCursor, count } };
        }

        // 1) 방 로드
        const roomIds = cursors.map((c) => c.roomId);
        const rooms = await this.chatRoomRepository.find({
            where: { id: In(roomIds) },
            relations: ['members', 'messages'],
        });
        const roomsById = new Map(rooms.map((r) => [r.id, r]));

        // 2) memberCount: 방별 활성 커서 수를 한 번에 집계
        const memberCounts = await this.cursorRepository
            .createQueryBuilder('c')
            .select('c.roomId', 'roomId')
            .addSelect('COUNT(*)', 'cnt')
            .where('c.roomId IN (:...roomIds)', { roomIds })
            .andWhere('c.deletedAt IS NULL')
            .groupBy('c.roomId')
            .getRawMany();

        const memberCountByRoomId = new Map<number, number>(
            memberCounts.map((r) => [Number(r.roomId), Number(r.cnt)]),
        );

        // 3) cursor별 데이터 생성 (동기 map으로 충분: 이제 await가 없음)
        const fixedData = cursors.map((cursor) => {
            const room = roomsById.get(cursor.roomId);

            if (!room) {
                return {
                    roomId: cursor.roomId,
                    name: cursor.roomNickName ?? '',
                    memberCount: memberCountByRoomId.get(cursor.roomId) ?? 0,
                    newMessageCount: 0,
                };
            }

            const messages = room.messages ?? [];

            // 필드명 점검: 엔티티가 lastReadMessageId면 그걸로 바꾸세요.
            const lastReadId = cursor.lastReadId ? BigInt(cursor.lastReadId) : BigInt(0);

            const unreadCount = messages.reduce((acc, m) => {
                const mid = BigInt(m.id);
                return acc + (mid > lastReadId ? 1 : 0);
            }, 0);

            return {
                roomId: room.id,
                name: cursor.roomNickName ?? room.name ?? '',
                memberCount: memberCountByRoomId.get(room.id) ?? 0,
                newMessageCount: unreadCount,
            };
        });

        return {
            data: fixedData,
            meta: { nextCursor, count },
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

        // 2) 방 + 멤버만 조회 (messages는 굳이 안 끌고 옴)
        const room = await this.chatRoomRepository.findOne({
            where: {id: roomId},
            relations: ['members', 'members.deptSite'],
        });

        if (!room) {
            throw new NotFoundException('채팅방을 찾을 수 없습니다.');
        }

        // 3) 최신 메시지 1개만 따로 조회 (createdAt 기준이든 id 기준이든 한 가지로 통일)
        const lastMessage = await this.messageRepository.findOne({
            where: {room: {id: roomId}},
            order: {id: 'DESC'},       // 또는 createdAt: 'DESC'
            select: ['id'],              // id만 필요하면 select 최소화
        });

        // 4) 커서 업데이트만 수행 (이 메서드에서는 unreadCount는 무조건 0으로 본다)
        if (lastMessage) {
            await this.cursorRepository.update(
                {roomId: cursor.roomId, mbNo: cursor.mbNo},
                {lastReadId: lastMessage.id},
            );
        }

        // 5) 요약 정보: 여기서는 "방에 들어온 시점"이므로 newMessageCount = 0 고정
        const summary = {
            roomId: room.id,
            name: cursor.roomNickName ?? room.name ?? '',
            memberCount: room.members?.length ?? 0,
            newMessageCount: 0,   // 이 메서드의 정책: 상세 들어오면 모두 읽은 걸로 처리
        };

        // 6) 상세 멤버 목록
        const activeMembers = await this.userRepository
            .createQueryBuilder('u')
            .innerJoin(ChatCursor, 'c', 'c.mbNo = u.mbNo')
            .where('c.roomId = :roomId', {roomId})
            .andWhere('c.deletedAt IS NULL')
            .getMany();

        const members = activeMembers
            .map((m) => ({
                mbNo: m.mbNo,
                name: m.mbName ?? '',
                department: (m as any).deptSite?.name ?? '', // 실제 relation 있으면 join해서 사용 권장
                registerNum: m.registerNum ?? '',
                mb5: m.mb5 ?? '',
                mb2: m.mb2 ?? '',
            }))
            .sort((a, b) => a.name.localeCompare(b.name, 'ko', {sensitivity: 'base'}));
        return {
            ...summary,
            members,
        };
    }

    async update(id: string, dto: UpdateRoomDto, mbNo: number) {
        const roomId = Number(id);

        return await this.dataSource.transaction(async (manager) => {
            // repositories bound to transaction
            const cursorRepo = manager.getRepository(ChatCursor);
            const roomRepo = manager.getRepository(ChatRoom);
            const userRepo = manager.getRepository(User);
            const deptRepo = manager.getRepository(Department);
            const msgRepo = manager.getRepository(ChatMessage);

            // 1) 내가 이 방 멤버인지 확인 (cursor 기준)
            const myCursor = await cursorRepo.findOne({
                where: {mbNo, roomId},
            });
            if (!myCursor) {
                throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
            }

            // 2) 방 + 기존 멤버 로드
            const room = await roomRepo.findOne({
                where: {id: roomId},
                relations: ['members'],
            });
            if (!room) {
                throw new NotFoundException('채팅방을 찾을 수 없습니다.');
            }

            // 공통: 시스템 메시지 기록 함수
            const pushSystem = async (content: string) => {
                await msgRepo
                    .createQueryBuilder()
                    .insert()
                    .into(ChatMessage)
                    .values({
                        room: {id: roomId},
                        type: MessageType.SYSTEM,
                        content,
                    })
                    .execute();
            };

            // A) 방 이름 수정: 방 이름은 그대로 두고, 내 커서 별칭만 변경
            if (dto.name) {
                myCursor.roomNickName = dto.name;
                await cursorRepo.save(myCursor);

                // 방 자체 이름도 바꾸려면 아래 주석 해제
                // room.name = dto.name;
                // await roomRepo.save(room);
            }

            // B) 멤버 추가(팀 + 개별) 및 "재입장" 감지/복구
            const hasMemberNos = (dto.memberNos?.length ?? 0) > 0;
            const hasTeamNos = (dto.teamNos?.length ?? 0) > 0;

            if (hasMemberNos || hasTeamNos) {
                // 1) 팀 멤버 조회
                const teams = await deptRepo.find({
                    where: {id: In(dto.teamNos ?? [])},
                    relations: ['members'],
                });
                const teamMembers: User[] = teams.flatMap((t) => t.members ?? []);

                // 2) 개별 멤버 조회
                const explicitMembers = await userRepo.find({
                    where: {mbNo: In(dto.memberNos ?? [])},
                });

                if (explicitMembers.length !== (dto.memberNos?.length ?? 0)) {
                    const foundSet = new Set(explicitMembers.map((u) => u.mbNo));
                    const missing = (dto.memberNos ?? []).filter((n) => !foundSet.has(n));
                    throw new NotFoundException(`존재하지 않는 사용자가 있습니다: ${missing.join(', ')}`);
                }

                // 3) 중복 제거(팀 + 개별)
                const memberMap = new Map<number, User>();
                const addMember = (m?: User) => {
                    if (!m?.mbNo) return;
                    memberMap.set(m.mbNo, m);
                };
                teamMembers.forEach(addMember);
                explicitMembers.forEach(addMember);

                const candidates = Array.from(memberMap.values());

                // 4) 이미 방에 "현재" 들어와 있는 멤버는 제외(초대/복구 대상만 남김)
                const existingNos = new Set((room.members ?? []).map((m) => m.mbNo));
                const targetUsers = candidates.filter((u) => !existingNos.has(u.mbNo));
                const targetNos = targetUsers.map((u) => u.mbNo);

                if (targetNos.length > 0) {
                    // 5) 기존 커서 조회(soft-deleted 포함) → 재입장/신규 구분
                    const existingCursors = await cursorRepo.find({
                        where: {roomId, mbNo: In(targetNos)},
                        withDeleted: true, // soft-deleted 포함
                    });

                    const cursorMap = new Map<number, ChatCursor>();
                    for (const c of existingCursors) cursorMap.set(c.mbNo, c);

                    // restore 대상: 커서가 존재 + deletedAt(soft delete) 상태
                    // 신규 대상: 커서가 아예 없음
                    const toRestoreNos: number[] = [];
                    const toInsertNos: number[] = [];

                    for (const mb of targetNos) {
                        const c = cursorMap.get(mb);
                        if (!c) {
                            toInsertNos.push(mb);
                            continue;
                        }
                        // DeleteDateColumn은 보통 c.deletedAt으로 접근 가능
                        // 타입 상 속성이 없으면 (c as any).deletedAt 로 확인
                        const deletedAt = (c as any).deletedAt;
                        if (deletedAt) toRestoreNos.push(mb);
                        // deletedAt이 없으면 사실상 이미 활성(논리상 여기로 오면 안 됨)
                    }

                    // 6) ChatRoom.members 관계 추가(초대/재입장 공통)
                    // 이미 관계에 남아있는(과거 데이터) 케이스까지 방어하려면,
                    // 실제로는 중복 add가 문제될 수 있어 "추가 대상"만 add
                    await roomRepo
                        .createQueryBuilder()
                        .relation(ChatRoom, 'members')
                        .of(roomId)
                        .add(targetNos);

                    // 닉네임 베이스
                    const nicknameBase = dto.name ?? myCursor.roomNickName ?? room.name ?? '';

                    // 7) 재입장 복구 처리 + 시스템 메시지("재입장")
                    if (toRestoreNos.length > 0) {
                        await cursorRepo.restore({roomId, mbNo: In(toRestoreNos)});

                        await cursorRepo.update(
                            {roomId, mbNo: In(toRestoreNos)},
                            {
                                roomNickName: nicknameBase,
                                lastReadId: '',
                            },
                        );

                        // 재입장 메시지: 복구된 사용자들 이름 묶어서 1개 메시지로 기록
                        const restoredUsers = targetUsers.filter((u) => toRestoreNos.includes(u.mbNo));
                        const restoredNames = restoredUsers
                            .map((u) => u.mbName ?? String(u.mbNo))
                            .join(', ');

                        await pushSystem(`${restoredNames}님이 재입장했습니다.`);
                    }

                    // 8) 신규 초대 처리(커서 insert)
                    if (toInsertNos.length > 0) {
                        await cursorRepo.insert(
                            toInsertNos.map((m) => ({
                                roomId,
                                mbNo: m,
                                roomNickName: nicknameBase,
                                lastReadMessageId: null,
                                lastReadAt: null,
                            })),
                        );

                        // 정책상 "초대" 메시지가 필요 없으시면 아래 블록은 제거하세요.
                        // const insertedUsers = targetUsers.filter((u) => toInsertNos.includes(u.mbNo));
                        // const insertedNames = insertedUsers.map((u) => u.mbName ?? String(u.mbNo)).join(', ');
                        // await pushSystem(`${insertedNames}님이 초대되었습니다.`);
                    }
                }
            }

            // C) 최종 방 정보 리턴
            const updated = await roomRepo.findOne({
                where: {id: roomId},
                relations: ['members'],
            });

            return updated;
        });
    }

    async remove(id: number, mbNo: number) {
        const user = await this.findUser(mbNo);

        return await this.dataSource.transaction(async (manager) => {
            const cursorRepo = manager.getRepository(ChatCursor);
            const roomRepo = manager.getRepository(ChatRoom);
            const msgRepo = manager.getRepository(ChatMessage);

            const cursor = await cursorRepo.findOne({
                where: {roomId: id, mbNo: user.mbNo},
            });
            if (!cursor) throw new NotFoundException('방을 찾을 수 없습니다.');

            // 1) 커서 soft delete
            await cursorRepo.softDelete({roomId: cursor.roomId, mbNo: cursor.mbNo});

            // 2) 관계에서도 제거(멤버 수/목록 즉시 반영)
            await roomRepo
                .createQueryBuilder()
                .relation(ChatRoom, 'members')
                .of(id)
                .remove(user.mbNo);

            // 3) 나가기 시스템 메시지
            const displayName = user.mbName ?? String(user.mbNo);
            await msgRepo
                .createQueryBuilder()
                .insert()
                .into(ChatMessage)
                .values({
                    room: {id},
                    type: MessageType.SYSTEM,
                    content: `${displayName}님이 나갔습니다.`,
                })
                .execute();

            return id;
        });
    }
}
