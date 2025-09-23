import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateRoomDto} from './dto/create-room.dto';
import {UpdateRoomDto} from './dto/update-room.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Room} from "./entities/room.entity";
import {DataSource, IsNull, Repository} from "typeorm";
import {RoomMember} from "./entities/room-member.entity";
import {User} from "../../user/entities/user.entity";
import {MemberRole, MessageType} from "../entities/chat.entity";
import {RoomReadCursor} from "../cursor/entities/room-read-cursor.entity";
import {Message} from "../messages/entities/message.entity";

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
    const me = await this.userRepository.findOne({where: {mbNo: meNo}});
    if (!me) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    // 1) memberIds 정리: 숫자화 → 중복 제거 → 자기 자신 제외
    const unique = Array.from(
      new Set((createRoomDto.memberIds ?? []).map(n => Number(n)).filter(n => Number.isFinite(n)))
    );
    const invitees = unique.filter(n => n !== meNo);
    // 2) 존재하는 유저만 필터링(안전)
    if (invitees.length) {
      const rows = await this.userRepository
        .createQueryBuilder('u')
        .select('u.mbNo', 'mbNo')
        .where('u.mbNo IN (:...ids)', {ids: invitees})
        .getRawMany<{ mbNo: number }>();
      const okSet = new Set(rows.map(r => r.mbNo));
      // 존재하는 초대 대상만 남기기
      for (let i = invitees.length - 1; i >= 0; i--) {
        if (!okSet.has(invitees[i])) invitees.splice(i, 1);
      }
    }

    return this.ds.transaction(async (tm) => {
      // 3) 방 생성
      const roomRepo = tm.getRepository(Room);
      const room = roomRepo.create({name: createRoomDto.name, createdBy: me});
      await roomRepo.save(room);

      // 4) 멤버 연결: 생성자 ADMIN
      const rmRepo = tm.getRepository(RoomMember);
      await rmRepo.save(
        rmRepo.create({
          roomId: room.id,
          userId: meNo,
          role: MemberRole.ADMIN,
          leftAt: null,
          lastActiveAt: null,
        }),
      );

      // 5) 멤버 연결: 초대 대상 벌크 업서트 (있으면 left_at NULL로 복귀)
      if (invitees.length) {
        await tm
          .createQueryBuilder()
          .insert()
          .into(RoomMember)
          .values(invitees.map(uid => ({
            roomId: room.id,
            userId: uid,
            role: MemberRole.MEMBER,
            leftAt: null,
          })))
          .orUpdate(['role', 'left_at'], ['roomId', 'userId'], {skipUpdateIfNoValuesChanged: true})
          .execute();
      }

      // 6) 커서 초기화: 생성자 + 초대자 모두 lastRead=0
      const cursorValues = [meNo, ...invitees].map(uid => ({
        roomId: room.id,
        userId: uid,
        lastReadMessageId: '0',      // ✅ bigint string 0
        lastReadAt: new Date(),
      }));
      if (cursorValues.length) {
        await tm
          .createQueryBuilder()
          .insert()
          .into(RoomReadCursor)
          .values(cursorValues)
          .orUpdate(
            ['last_read_message_id', 'last_read_at'], // ✅ 올바른 갱신 컬럼
            ['roomId', 'userId'],
            {skipUpdateIfNoValuesChanged: true},
          )
          .execute();
      }

      // 7) 시스템 메시지
      await tm
        .createQueryBuilder()
        .insert()
        .into(Message)
        .values({
          room,
          content: `${me.mbNick}님이 방을 생성했습니다.`,
          type: MessageType.SYSTEM,
          user: me, // 정책에 따라 null 로 둬도 됨
        })
        .execute();

      return {roomId: room.id, name: room.name, members: [meNo, ...invitees]};
    });
  }

  async findMyRooms(req: any, limit = 50, offset = 0) {
    const me = await this.userRepository.findOne({
      where: {
        mbNo: req.user.sub,
      }
    });

    if (!me) throw new NotFoundException('사용자를 찾을 수 없습니다.')

    const myRooms = await this.roomMemberRepository.find({
      where: {
        userId: me.mbNo,
        leftAt: IsNull(),
      },
      relations: ['room'],
      order: {lastActiveAt: "DESC"}
    });
    if (!myRooms.length) return {items: []};
    const roomIds = myRooms.map(r => r.roomId);


    const qb = this.roomRepository.createQueryBuilder('r')
      .where('r.id In(:...roomIds)', {roomIds})
      .leftJoin(RoomReadCursor, 'c', 'c.roomId = r.id AND c.userId = :uid', {uid: me.mbNo})
      .addSelect((sq) => {
        // unreadCount 서브쿼리
        return sq
          .select('COUNT(1)', 'unread')
          .from(Message, 'm')
          .where('m.roomId = r.id')
          .andWhere('m.id > COALESCE(c.last_read_message_id, 0)');
      }, 'unreadCount')
      // lastMessage id/content/type/created_at 서브쿼리들
      .addSelect((sq) => {
        return sq
          .select('m2.id')
          .from(Message, 'm2')
          .where('m2.roomId = r.id')
          .orderBy('m2.id', 'DESC')
          .limit(1);
      }, 'lastMessageId')
      .addSelect((sq) => {
        return sq
          .select('COUNT(1)')
          .from(RoomMember, 'rm')
          .where('rm.roomId = r.id')
          .andWhere('rm.leftAt IS NULL');
      }, 'memberCount')
      // 정렬: 마지막 메시지 시각 DESC, 그 다음 이름
      .addSelect((sq) => {
        return sq
          .select('m5.created_at')
          .from(Message, 'm5')
          .where('m5.roomId = r.id')
          .orderBy('m5.id', 'DESC')
          .limit(1);
      }, 'lastMessageAt')
      .orderBy('lastMessageAt', 'DESC')
      .addOrderBy('r.name', 'ASC')
      .limit(limit)
      .offset(offset);

    const rows = await qb.getRawAndEntities();
    // rows.entities[i] ↔ rows.raw[i] 매칭해서 응답 형태 구성
    const items = rows.entities.map((room, i) => ({
      roomId: room.id,
      name: room.name,
      unreadCount: Number(rows.raw[i]['unreadCount']) || 0,
      memberCount: Number(rows.raw[i]['memberCount']) || 0,
    }));

    return {items};
  }

  findOne(id: number) {
    return `This action returns a #${id} room`;
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }
}
