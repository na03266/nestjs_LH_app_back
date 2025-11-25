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
            }
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
                    roomNickName: CreateChatRoomDto.name,
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

        const model =await qr.manager.findOne(ChatRoom, {
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
        const [data, count] = await qb.getManyAndCount();

        if (data.length === 0) return {
            data: [], meta: {nextCursor, count},
        };

        const chatRooms = await this.chatRoomRepository.find({
            where: {id: In(data.map(e => e.roomId))},
            relations: ['members'],
        });

        const roomsById = new Map(chatRooms.map(r => [r.id, r]));

        const fixedData = data.map((e) => {
            const room = roomsById.get(e.roomId);
            const name = room?.name ?? e.room?.name ?? '';

            const lastReadAt = e.lastReadId ?? new Date(0);

            const messages = room?.messages ?? [];
            const unreadCount = messages.reduce((acc, m) => acc + (m.id > lastReadAt ? 1 : 0), 0);

            return {
                roomId: e.roomId,
                name,
                memberCount: room?.members?.length ?? 0,
                newMessageCount: unreadCount,
            };
        });

        return {
            data: fixedData,
            meta: {nextCursor, count},
        };
    }


    async findOne(roomId: number, mbNo: number) {
        const room = await this.chatRoomRepository.findOne({
            where: {
                id: roomId,
            },
            relations: ['members'],
        })
        if (!room) throw new NotFoundException('채팅방을 찾을 수 없습니다.');
        const cursor = await this.cursorRepository.findOne({
            where: {
                mbNo: mbNo,
                roomId,
            }
        });

        if (!cursor) throw new BadRequestException('잘못된 요청입니다')
        await this.cursorRepository.update(
            {roomId: cursor.roomId, mbNo: cursor.mbNo},
            {lastReadId: new Date().toISOString()},
        );

        return room;
    }

    async update(id: string, dto: UpdateRoomDto, mbNo: number) {
        const room = await this.findOne(+id, mbNo);

        room.name = dto.name;
        return await this.chatRoomRepository.save(room);
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
