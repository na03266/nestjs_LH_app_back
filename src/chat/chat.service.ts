import {BadRequestException, ForbiddenException, Injectable} from '@nestjs/common';
import {Socket} from "socket.io";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../user/entities/user.entity";
import {EntityManager, QueryRunner, Repository} from "typeorm";
import {ChatRoom} from "./chat-room/entities/chat-room.entity";
import {ChatMessage, MessageType} from "./messages/entities/chat-message.entity";
import {CreateMessageDto} from "./messages/dto/create-message.dto";
import {ChatCursor} from "./cursor/entities/chat-cursor.entity";
import {join} from "path";
import {rename} from "node:fs/promises";

@Injectable()
export class ChatService {
  /** 여러 기기 동시 접속 대비: userId -> Set<Socket> */
  private readonly connectClients = new Map<number, Set<Socket>>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ChatCursor)
    private readonly cursorRepository: Repository<ChatCursor>,
    @InjectRepository(ChatRoom)
    private readonly roomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,
  ) {
  }

  // ───────────────────────── 연결 관리 ─────────────────────────
  registerClient(userMbNo: number, client: Socket) {
    if (!this.connectClients.has(userMbNo)) this.connectClients.set(userMbNo, new Set());
    this.connectClients.get(userMbNo)!.add(client);
  }

  removeClient(userId: number, client?: Socket) {
    if (!this.connectClients.has(userId)) return;
    if (client) {
      this.connectClients.get(userId)!.delete(client);
      if (this.connectClients.get(userId)!.size === 0) this.connectClients.delete(userId);
    } else {
      this.connectClients.delete(userId);
    }
  }

  // ───────────────────────── 로비/룸 조인(서버 전송 X) ─────────────────────────
  /** 접속 직후: 로비(개인 알림 룸)만 조인 */
  async joinLobby(user: { sub: number }, client: Socket) {
    client.join(`user:${user.sub}`);
  }

  /** 방 멤버 여부 빠른 체크 */
  async isRoomMember(roomId: number, mbNo: number, em: EntityManager = this.cursorRepository.manager) {
    const row = await em
      .createQueryBuilder()
      .select('1')
      .from('chat_cursor', 'm')            // 조인 테이블 실제명에 맞게
      .where('m.roomId = :roomId AND m.mbNo = :mbNo', {roomId, mbNo})
      .getRawOne();
    return !!row;
  }

  /** 방 조인(권한만 검증) — 게이트웨이에서 client.join('room:...') 호출 */
  async ensureJoinable(roomId: number, userMbNo: number, em: EntityManager = this.roomRepository.manager) {
    const ok = await this.isRoomMember(roomId, userMbNo, em);
    if (!ok) throw new ForbiddenException('not a member');
  }

  // ───────────────────────── 멤버/요약 유틸 ─────────────────────────
  async getRoomMemberNos(roomId: number, em: EntityManager = this.cursorRepository.manager): Promise<number[]> {
    const rows = await em
      .createQueryBuilder()
      .select('m.mbNo', 'mbNo')
      .from('chat_cursor', 'm')
      .where('m.roomId = :roomId', {roomId})
      .getRawMany<{ mbNo: number }>();
    return rows.map(r => r.mbNo);
  }

  /** 내 목록 카드/배지 요약 (myUnreadCount, lastMessage 등) */
  async makeRoomSummary(roomId: number, viewerMbNo: number, em: EntityManager = this.roomRepository.manager) {
    // 마지막 메시지
    const last = await em.createQueryBuilder(ChatMessage, 'm')
      .where('m.roomId = :roomId', {roomId})
      .orderBy('m.id', 'DESC')                // ULID/시퀀스/auto-inc에 맞게
      .select(['m.id AS id', 'm.content AS content', 'm.createdAt AS createdAt'])
      .getRawOne<{ id: string; content: string; createdAt: Date }>();

    // 내 커서
    const cursor = await this.cursorRepository.findOne({
      where: {roomId, mbNo: viewerMbNo},
    });


    // 내 안읽음 수 (성능 필요 시 COUNT(*) 대신 최근 seq 차이 방식으로 개선)
    const myUnreadCount = await em.createQueryBuilder(ChatMessage, 'm')
      .where('m.roomId = :roomId', {roomId})
      .andWhere(cursor?.lastReadId ? 'm.lastReadId > :t' : '1=1', {t: cursor?.lastReadId})
      .getCount();

    return {
      roomId,
      myUnreadCount,
      lastMessageId: last?.id ?? null,
      lastMessage: last?.content ?? null,
      lastMessageAt: last?.createdAt ?? null,
    };
  }

  /** 마지막 메시지 기준 “안 읽은 사람 수”(그룹 지표) */
  async calcUnreadMembers(roomId: number, em: EntityManager = this.cursorRepository.manager): Promise<number> {
    const [{total}] = await em.createQueryBuilder()
      .select('COUNT(*)', 'total')
      .from('chat_cursor', 'm')
      .where('m.roomId = :roomId', {roomId})
      .getRawMany<{ total: string }>();

    const last = await em.createQueryBuilder(ChatMessage, 'm')
      .where('m.roomId = :roomId', {roomId})
      .orderBy('m.id', 'DESC')
      .select('m.id', 'id')
      .getRawOne<{ id: string }>();

    if (!last?.id) return 0;

    const [{readers} = {readers: 0}] = await em.createQueryBuilder(ChatCursor, 'c')
      .select('COUNT(*)', 'readers')
      .where('c.roomId = :roomId', {roomId})
      .andWhere('c.lastReadId >= :lastReadId', {lastReadId: last.id})
      .getRawMany<{ readers: string }>();

    if (Number(total) - Number(readers) > 99) {
      return 99;
    } else {
      return Number(total) - Number(readers);
    }
  }

  // ───────────────────────── 메시지 생성 (전송 비의존) ─────────────────────────
  renameFile(tempFolder: string, fileFolder: string, createMessageDto: CreateMessageDto) {
    return rename(
      join(process.cwd(), tempFolder, createMessageDto.fileName),
      join(process.cwd(), fileFolder, createMessageDto.fileName),
    );
  }
  /**
   * 메시지 생성(트랜잭션 내)
   * 게이트웨이는 반환값을 받아 방/사용자 룸으로 emit만 하면 됨.
   */
  async createMessage(
    payload: { sub: number },
    dto: CreateMessageDto,                 // { room: number; message: string; messageType?; tempId? }
    qr: QueryRunner,
  ): Promise<{
    roomId: number;
    message: ChatMessage;                  // 방에 브로드캐스트할 payload
    notifyMembers: number[];               // 목록/배지 갱신 대상 사용자 mbNo[]
    groupUnreadMembers: number;            // 그룹 안읽은 사람 수 (옵션)
    summaryByUser?: Record<number, {
      roomId: number;
      myUnreadCount: number;
      lastMessageId: any;
      lastMessage: string | null;
      lastMessageAt: Date | null
    }>;
    tempId?: string;
  }> {
    const em = qr.manager;
    const {roomId, message} = dto;

    // 1) 사용자/방 조회
    const user = await em.findOne(User, {where: {mbNo: payload.sub}});
    if (!user) throw new BadRequestException('사용자를 찾을 수 없습니다.');

    const chatRoom = await em.findOne(ChatRoom, {where: {id: roomId}});
    if (!chatRoom) throw new BadRequestException('채팅방을 찾을 수 없습니다.');

    // 2) 멤버십 검증
    const ok = await this.isRoomMember(roomId, user.mbNo, em);
    if (!ok) throw new ForbiddenException('채팅방 멤버가 아닙니다.');

    const fileFolder = join('public', 'file');
    const tempFolder = join('public', 'temp');


    // 3) 메시지 저장
    const saved = await em.save(ChatMessage, {
      author: user,          // or authorId
      room: chatRoom,        // or roomId
      content: message,
      type: dto.messageType ?? MessageType.TEXT,
      fileName: join(fileFolder, dto.fileName),
    });

    await this.renameFile(tempFolder, fileFolder, dto);

    // 4) 보낸 사람 커서 즉시 읽음 처리(내 unread 0 유지)
    await em.createQueryBuilder()
      .update(ChatCursor)
      .set({lastReadId: saved.id})
      .where('roomId = :roomId AND mbNo = :mbNo', {roomId: roomId, mbNo: user.mbNo})
      .execute();

    // 5) 알림 대상/요약 계산(게이트웨이에서 emit 용)
    const memberNos = await this.getRoomMemberNos(roomId, em);

    // 그룹 지표: 마지막 메시지 기준 안 읽은 사람 수
    const unreadMembers = await this.calcUnreadMembers(roomId, em);

    // 각 사용자별 목록 카드 요약이 필요하면(트래픽 많으면 생략하고 poke만 보내도 됨)
    // 여기선 예시로 전원 요약을 만들지만, 규모 크면 viewer별 on-demand로 바꾸세요.
    // const summaryByUser: Record<number, any> = {};
    // for (const mbNo of memberNos) {
    //   summaryByUser[mbNo] = await this.makeRoomSummary(room, mbNo, em);
    // }

    return {
      roomId: roomId,
      message: saved,
      notifyMembers: memberNos,
      groupUnreadMembers: unreadMembers,
      // summaryByUser,
      // tempId: dto.tempId,
    };
  }

  // ───────────────────────── 커서 업데이트(읽음) ─────────────────────────
  /**
   * 클라이언트가 하단 도달/포커스 등의 조건에서 호출.
   * 멱등(GREATEST) 보장.
   */
  async updateCursor(
    userMbNo: number,
    roomId: number,
    lastReadMessageId?: string | number,
    qr?: QueryRunner,
  ): Promise<{
    summaryForUser: {
      roomId: number;
      myUnreadCount: number;
      lastMessageId: any;
      lastMessage: string | null;
      lastMessageAt: Date | null
    };
    groupUnreadMembers: number;
  }> {
    const em = qr?.manager ?? this.cursorRepository.manager;

    // 멤버십 체크(옵션)
    const ok = await this.isRoomMember(roomId, userMbNo, em);
    if (!ok) throw new ForbiddenException('not a member');

    // 커서 올리기 (둘 다 관리할거면 lastReadAt도 함께)
    if (lastReadMessageId != null) {
      await em.createQueryBuilder()
        .update(ChatCursor)
        .set({
          lastReadMessageId: () => `GREATEST(COALESCE(last_read_message_id, 0), ${Number(lastReadMessageId)})`,
          lastReadAt: () => 'CURRENT_TIMESTAMP',
        } as any)
        .where('roomId = :roomId AND mbNo = :mbNo', {roomId, mbNo: userMbNo})
        .execute();
    } else {
      await em.createQueryBuilder()
        .update(ChatCursor)
        .set({lastReadAt: () => 'CURRENT_TIMESTAMP'} as any)
        .where('roomId = :roomId AND mbNo = :mbNo', {roomId, mbNo: userMbNo})
        .execute();
    }

    const summaryForUser = await this.makeRoomSummary(roomId, userMbNo, em);
    const groupUnreadMembers = await this.calcUnreadMembers(roomId, em);

    return {summaryForUser, groupUnreadMembers};
  }
}
