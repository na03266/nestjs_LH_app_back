import {Injectable} from '@nestjs/common';
import {UpdateMessageDto} from './dto/update-message.dto';
import {Repository} from "typeorm";
import {WsException} from "@nestjs/websockets";
import {User} from "../../user/entities/user.entity";
import {InjectRepository} from "@nestjs/typeorm";

@Injectable()
export class MessagesService {
  constructor(
    // @InjectRepository(User)
    // private readonly userRepository: Repository<User>,
  ) {
  }

  /**
   * 메세지 생성
   * 삭제,
   */

  async findUser(mbNo: number) {
    // const user = await this.userRepository.findOne({
    //   where: {mbNo},
    // });
    // if (!user) throw new WsException('사용자를 찾을 수 없습니다.');
    //
    // return user;
  }


  // async create(payload: { sub: number }, {message, room}: CreateChatDto, qr: QueryRunner) {
  //   const user = await this.findUser(payload.sub);
  //
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

  findAll() {
    return `This action returns all messages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
