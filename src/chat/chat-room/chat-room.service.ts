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

@Injectable()
export class ChatRoomService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(ChatRoom)
        private readonly chatRoomRepository: Repository<ChatRoom>,
        @InjectRepository(ChatCursor)
        private readonly cursorRepository: Repository<ChatCursor>,
        private readonly commonService: CommonService,
        private readonly dataSource: DataSource,
    ) {
    }

    async findUser(mbNo: number) {
        const user = await this.userRepository.findOne({where: {mbNo}})
        if (!user) throw new NotFoundException("사용자를 찾을 수 없습니다.");

        return user;
    }

    async create(createChatRoomDto: CreateChatRoomDto, mbNo: number, qr: QueryRunner) {
        const user = await this.findUser(mbNo);

        const members = await qr.manager.find(User, {
            where: {
                mbNo: In(createChatRoomDto.memberNos)
            },
        })

        if (members.length !== createChatRoomDto.memberNos.length) throw new NotFoundException('존재하지 않는 사용자가 있습니다.')

        members.push(user);

        const room = await qr.manager.createQueryBuilder()
            .insert()
            .into(ChatRoom)
            .values({
                name: createChatRoomDto.name,
            })
            .execute();

        const roomId = room.identifiers[0].id;

        await qr.manager.createQueryBuilder()
            .relation(ChatRoom, 'members')
            .of(roomId)
            .add(members.map(m => m.mbNo));

        await qr.manager.createQueryBuilder()
            .insert()
            .into(ChatCursor)
            .values(
                members.map(m => ({
                    roomId,
                    mbNo: m.mbNo,
                    roomNickName: createChatRoomDto.name,
                    lastReadMessageId: null,
                    lastReadAt: null,
                })))
            .execute();

        await qr.manager.createQueryBuilder()
            .insert()
            .into(ChatMessage)
            .values({
                room: roomId,
                type: MessageType.SYSTEM,
                content: `'${createChatRoomDto.name}' 채팅방이 생성되었습니다.`,
            })
            .execute()

        const model = await qr.manager.findOne(ChatRoom, {
            where: {id: roomId},
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
//         const room = await this.findOne(+id, mbNo);
// // todo 이부분 커서 변경 하는 걸로 전환
//         room.name = dto.name;
//         return await this.chatRoomRepository.save(room);
    }

    async addMember(id: string, dto: AddMembersDto, qr: QueryRunner) {
        const roomId = Number(id);

        // 1) 방 + 기존 멤버 읽기(트랜잭션 매니저 사용 권장)
        const room = await qr.manager.findOne(ChatRoom, {
            where: {id: roomId},
            relations: ['members'],
        });
        if (!room) throw new NotFoundException('방을 찾을 수 없습니다.');

        // 2) 후보 정리(중복 제거)
        const incoming = Array.from(new Set(dto.userIds ?? []));

        // 3) 기존 멤버 제외
        const existingNos = new Set(room.members.map((m) => m.mbNo));
        const newNos = incoming.filter((mbNo) => !existingNos.has(mbNo));
        if (newNos.length === 0) {
            return room.members.map((m) => m.mbNo);
        }

        // 4) 존재 사용자 일괄 검증 (한 번의 IN 쿼리)
        const found = await qr.manager.find(User, {where: {mbNo: In(newNos)}});
        if (found.length !== newNos.length) {
            const foundSet = new Set(found.map((u) => u.mbNo));
            const missing = newNos.filter((x) => !foundSet.has(x));
            throw new NotFoundException(`존재하지 않는 사용자: ${missing.join(', ')}`);
        }

        const temp = await qr.manager.findOne(ChatRoom, {
            where: {
                id: +id,
            },
            relations: ['members'],
        });
        return temp?.members.map(m => m.mbNo);
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
