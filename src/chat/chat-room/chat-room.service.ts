import {Injectable, NotFoundException} from '@nestjs/common';
import {UpdateRoomDto} from './dto/update-room.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {In, QueryRunner, Repository} from "typeorm";
import {User} from "../../user/entities/user.entity";
import {CreateChatRoomDto} from "./dto/create-chat-room.dto";
import {ChatRoom} from "./entities/chat-room.entity";
import {ChatCursor} from "../cursor/entities/chat-cursor.entity";
import {ChatMessage, MessageType} from "../messages/entities/chat-message.entity";
import {GetChatRoomsDto} from "./dto/get-chat-rooms.dto";
import {CommonService} from "../../common/common.service";

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
        content: `'${CreateChatRoomDto.name}' 채팅방이 생성되었습니다.`,
      })
      .execute()

    return await qr.manager.findOne(ChatRoom, {
      where: {id: roomId},
    });
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
    qb.andWhere('cursor.mbNo = :mbNo', {mbNo});
    const {nextCursor} = await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

    let [data, count] = await qb.getManyAndCount();

    const chatRooms = await this.chatRoomRepository.find({
      where: {
        id: In(data.map(e => e.roomId))
      },
      relations: ['messages', 'members'],
    });

    const roomsById = new Map(chatRooms.map(r => [r.id, r]));

    const fixedData = data.map((e) => {
      const room = roomsById.get(e.roomId);
      const name = room?.name ?? e.room?.name ?? '';

      // id가 BIGINT 가능 → BigInt로 안전 비교 (숫자면 Number(...)로 바꿔도 됩니다)
      const lastReadId = e.lastReadMessageId ? BigInt(e.lastReadMessageId) : 0n;

      const messages = room?.messages ?? [];
      const unreadCount = messages.reduce((acc, m) => {
        const mid = BigInt(m.id);
        return acc + (mid > lastReadId ? 1 : 0); // 마지막 읽음 이후만 카운트
      }, 0);

      return {
        roomId: e.roomId,
        name,
        memberCount: room?.members?.length ?? 0,
        newMessageCount: unreadCount,
      };0
    });
    return {
      fixedData,
      nextCursor,
      count,
    }
  }

  async findOne(id: string) {
    // 채팅을 불러와서 보여주는 부분
    return `This action returns a #${id} room`;
  }

  update(id: string, updateRoomDto: UpdateRoomDto) {

    return `This action updates a #${id} room`;
  }

  async remove(id: number) {
    const room = await this.chatRoomRepository.find({where: {id}});
    if (!room) throw new NotFoundException('방을 찾을 수 없습니다.');

    await this.chatRoomRepository.softDelete({id});
    return id;
  }
}
