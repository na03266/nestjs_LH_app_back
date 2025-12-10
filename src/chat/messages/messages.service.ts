import {Injectable, NotFoundException} from '@nestjs/common';
import {QueryRunner, Repository} from "typeorm";
import {WsException} from "@nestjs/websockets";
import {User} from "../../user/entities/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {CreateMessageDto} from "./dto/create-message.dto";
import {ChatMessage} from "./entities/chat-message.entity";
import {ChatRoom} from "../chat-room/entities/chat-room.entity";
import {ChatCursor} from "../cursor/entities/chat-cursor.entity";
import {GetMessagesDto} from "./dto/get-messages.dto";
import {CommonService} from "../../common/common.service";

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(ChatRoom)
        private readonly roomRepository: Repository<ChatRoom>,
        @InjectRepository(ChatMessage)
        private readonly messageRepository: Repository<ChatMessage>,
        @InjectRepository(ChatCursor)
        private readonly cursorRepository: Repository<ChatCursor>,
        private readonly commonService: CommonService,
    ) {
    }

    /**
     * 메세지 생성
     * 삭제,
     */

    async findUser(mbNo: number) {
        const user = await this.userRepository.findOne({
            where: {mbNo},
        });
        if (!user) throw new WsException('사용자를 찾을 수 없습니다.');

        return user;
    }

    async findChatRoom(id: number) {
        const room = await this.roomRepository.findOne({
            where: {id},
        });
        if (!room) throw new WsException('채팅방을 찾을 수 없습니다.');

        return room;
    }


    async create(mbNo: number, dto: CreateMessageDto, qr: QueryRunner) {
        const user = await this.findUser(mbNo);

        const chatRoom = await this.findChatRoom(dto.roomId);

        return await qr.manager.save(ChatMessage, {
            content: dto.message,
            type: dto.messageType,
            room: chatRoom,
            author: user,
        });
    }

    async getMessages(dto: GetMessagesDto, mbNo: number) {
        const {roomId} = dto;


        // 1) 이 방에 들어갈 권한이 있는지 검증
        const cursor = await this.cursorRepository.findOne({
            where: {
                roomId,
                mbNo
            },
        });
        if(!cursor){
            throw new NotFoundException('소속된 채팅방을 찾을 수 없습니다.');
        }

        // 2) 쿼리빌더
        const qb = this.messageRepository
            .createQueryBuilder('m')
            .where('m.roomId = :roomId', {roomId})
            .orderBy('m.id', 'DESC'); // 최신부터

        // 3) 공통 cursor 페이지네이션 적용
        const {nextCursor} =
            await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

        const [rows, count] = await qb.getManyAndCount();

        // UI는 보통 오래된 → 최신 순 정렬이 자연스럽기 때문에 뒤집어서 보냄
        const data = rows.reverse();
        const resultMessages = data.map((m) => ({
            id: m.id,
            author: m.author?.mbName ?? '',    // 실제 필드명에 맞게 수정
            createdAt: m.createdAt,            // ChatMessage.createdAt
            content: m.content,                // ChatMessage.content
            filePath: m.filePath??'',
            isMine: m.authorNo === mbNo,  // 본인 메시지 여부
            type: m.type,
        }));

        return {
            data: resultMessages,
            meta: {
                nextCursor,
                count,
            },
        };
    }

    async remove(id: string, mbNo: number) {
        const message = await this.messageRepository.findOne({where: {id}, relations: ['author']});

        if (!message) throw new WsException('메시지를 찾을 수 없습니다.');
        if (message.authorNo !== mbNo) throw new WsException('본인이 작성한 메시지만 삭제할 수 있습니다.');

        await this.messageRepository.softDelete({id});
        return id;
    }
}
