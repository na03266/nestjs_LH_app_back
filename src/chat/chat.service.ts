import {Injectable} from '@nestjs/common';
import {Socket} from "socket.io";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../user/entities/user.entity";
import {Repository} from "typeorm";
import {Chat} from "./entities/chat.entity";
import {ChatRoom} from "./chat-room/entities/chat-room.entity";

@Injectable()
export class ChatService {
  private readonly connectClients = new Map<number, Socket>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
  ) {
  }

  registerClient(userId: number, client: Socket) {
    this.connectClients.set(userId, client);
  }

  removeClient(userId: number) {
    this.connectClients.delete(userId);
  }

  async joinUserRooms(user: { sub: number }, client: Socket) {
    const chatRooms = await this.chatRoomRepository.createQueryBuilder('chatRoom')
      .innerJoin('chatRoom.users', 'user', 'user.id = :userId', {userId: user.sub})
      .getMany();

    chatRooms.forEach((room) => {
      client.join(room.id.toString());
    });
  }

  // async createMessage(payload: { sub: number }, {message, room}: CreateChatDto, qr: QueryRunner) {
  //   const user = await this.userRepository.findOne({
  //     where: {mbNo: payload.sub},
  //   });
  //
  //   if (!user) throw new WsException('사용자를 찾을 수 없습니다.');
  //   // const chatRoom = await this.getOrCreateChatRoom(user, qr, room);
  //
  //   if (!user) throw new WsException('사용자를 찾을 수 없습니다.');
  //
  //   const msgModel = await qr.manager.save(Chat, {
  //     author: user,
  //     message,
  //     chatRoom,
  //   });
  //
  //   const client = this.connectClients.get(user.mbNo);
  //
  //   if (!client) throw new WsException('정보를 찾을 수 없습니다.')
  //
  //   client.to(chatRoom.id.toString()).emit('newMessage', plainToClass(Chat, msgModel));
  //
  //   return message;
  // }

  // async createChatRoom(payload: { sub: number }, {member}: CreateChatDto, qr: QueryRunner) {
  //   /**
  //    * 생성자,
  //    * 방 생성,
  //    *
  //    */
  //   const user = await this.userRepository.findOne({
  //     where: {mbNo: payload.sub},
  //   });
  //
  //   if (!user) throw new WsException('사용자를 찾을 수 없습니다.');
  //   // const chatRoom = await this.getOrCreateChatRoom(user, qr, room);
  //
  //   if (!user) throw new WsException('사용자를 찾을 수 없습니다.');
  //
  //   const msgModel = await qr.manager.save(Chat, {
  //     author: user,
  //     message,
  //     chatRoom,
  //   });
  //
  //   const client = this.connectClients.get(user.mbNo);
  //
  //   if (!client) throw new WsException('정보를 찾을 수 없습니다.')
  //
  //   client.to(chatRoom.id.toString()).emit('newMessage', plainToClass(Chat, msgModel));
  //
  //   return message;
  // }

  // async getOrCreateChatRoom(user: User, qr: QueryRunner, room?: number): Promise<ChatRoom> {
  //   if (user.mbLevel >= 4) {
  //     if (!room) {
  //       throw new WsException('관리자는 room 값을 필수로 제공해야합니다.');
  //     }
  //     const chatRoom = await qr.manager.findOne(ChatRoom, {where: {id: room}, relations: ['users']});
  //
  //     if (!chatRoom) throw new WsException('채팅룸을 찾을 수 없습니다.');
  //
  //     return chatRoom;
  //   }
  //
  //   let chatRoom = await qr.manager.createQueryBuilder(ChatRoom, 'chatRoom')
  //     .innerJoin('chatRoom.users', 'user')
  //     .where('user.id = :userId', {userId: user.id})
  //     .getOne();
  //
  //   if (!chatRoom) {
  //     const adminUser = await qr.manager.findOne(User, {where: {mbLevel: Role.admin}});
  //
  //     if (!adminUser) throw new WsException('관리자로 등록된 사람이 없습니다.');
  //
  //     chatRoom = await this.chatRoomRepository.save({
  //       users: [user, adminUser],
  //     });
  //
  //     [user.id, adminUser.id].forEach((userId) => {
  //       const client = this.connectClients.get(userId);
  //
  //       if (client) {
  //         client.emit('roomCreated', chatRoom!.id);
  //         client.join(chatRoom!.id.toString());
  //       }
  //     });
  //   }
  //
  //   return chatRoom;
  // }

}
