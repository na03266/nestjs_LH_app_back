import {Injectable} from '@nestjs/common';
import {QueryRunner, Repository} from "typeorm";
import {WsException} from "@nestjs/websockets";
import {User} from "../../user/entities/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {CreateMessageDto} from "./dto/create-message.dto";
import {ChatMessage} from "./entities/chat-message.entity";
import {ChatRoom} from "../chat-room/entities/chat-room.entity";

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ChatRoom)
    private readonly roomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,
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

    const chatRoom = await this.findChatRoom(dto.room);

    return await qr.manager.save(ChatMessage, {
      content: dto.message,
      type: dto.messageType,
      room: chatRoom,
      author: user,
    });
  }


  async remove(id: string, mbNo: number) {
    const message = await this.messageRepository.findOne({where: {id}, relations: ['author']});

    if (!message) throw new WsException('메시지를 찾을 수 없습니다.');
    if (message.authorNo !== mbNo) throw new WsException('본인이 작성한 메시지만 삭제할 수 있습니다.');

    await this.messageRepository.softDelete({id});
    return id;
  }
}
