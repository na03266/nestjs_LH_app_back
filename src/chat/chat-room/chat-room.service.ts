import {Injectable, NotFoundException} from '@nestjs/common';
import {UpdateRoomDto} from './dto/update-room.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {DataSource, In, QueryRunner, Repository} from "typeorm";
import {User} from "../../user/entities/user.entity";
import {CreateChatRoomDto} from "./dto/create-chat-room.dto";
import {ChatRoom} from "./entities/chat-room.entity";
import {ChatCursor} from "../cursor/entities/chat-cursor.entity";

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    private readonly ds: DataSource,
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
      .relation(ChatRoom, 'users')
      .of(roomId)
      .add(members.map(user => user.mbNo));

    await qr.manager.createQueryBuilder()
      .insert()
      .into(ChatCursor)
      .values(
        members.map(m => ({
          roomId,
          userId: m.mbNo,
          lastReadMessageId: null,
          lastReadAt: null,
        })))
      .execute();

    return await qr.manager.findOne(ChatRoom, {
      where: {id: roomId},
    });
  }

  async findMyRooms(req: any, limit = 50, offset = 0) {

  }

  async findOne(id: string) {
    // 채팅을 불러와서 보여주는 부분
    return `This action returns a #${id} room`;
  }

  update(id: string, updateRoomDto: UpdateRoomDto) {

    return `This action updates a #${id} room`;
  }

  async remove(id: string) {
    const room = await this.chatRoomRepository.find({where: {id}});
    if (!room) throw new NotFoundException('방을 찾을 수 없습니다.');

    await this.chatRoomRepository.softDelete({id});
    return id;
  }
}
