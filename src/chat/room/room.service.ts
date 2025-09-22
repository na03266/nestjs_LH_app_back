import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateRoomDto} from './dto/create-room.dto';
import {UpdateRoomDto} from './dto/update-room.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Room} from "./entities/room.entity";
import {DataSource, Repository} from "typeorm";
import {RoomMember} from "./entities/room-member.entity";
import {User} from "../../user/entities/user.entity";
import {MemberRole} from "../entities/chat.entity";

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomMember)
    private readonly roomMemberRepository: Repository<RoomMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly ds: DataSource,
  ) {
  }

  async create(createRoomDto: CreateRoomDto, req: any) {
    const meNo = Number(req.user.sub);
    const me = await this.userRepository.findOne({where: {mbNo: meNo}})

    if (!me) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    // 2) 트랜잭션: 방 생성 + 멤버 연결
    return this.ds.transaction(async (tm) => {
      // 방 생성
      const room = this.roomRepository.create({name: createRoomDto.name, createdBy: me});
      await tm.getRepository(Room).save(room);

      // 멤버 연결(생성자 ADMIN)
      const rm = tm.getRepository(RoomMember).create({
        roomId: room.id,
        userId: meNo,
        role: MemberRole.ADMIN,
        leftAt: null,
        lastActiveAt: null,
      });

      await tm.getRepository(RoomMember).save(rm);
      return {roomId: room.id, name: room.name};
    });

  }

  findAll() {
    return `This action returns all room`;
  }

  findOne(id
          :
          number
  ) {
    return `This action returns a #${id} room`;
  }

  update(id
         :
         number, updateRoomDto
         :
         UpdateRoomDto
  ) {
    return `This action updates a #${id} room`;
  }

  remove(id
         :
         number
  ) {
    return `This action removes a #${id} room`;
  }
}
