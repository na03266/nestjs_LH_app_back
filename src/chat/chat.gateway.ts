import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer, WsException
} from '@nestjs/websockets';
import {ChatService} from './chat.service';
import {AuthService} from "../auth/auth.service";
import {QueryRunner} from 'typeorm';
import {Server, Socket} from "socket.io";
import {CreateMessageDto} from "./messages/dto/create-message.dto";
import {WsTransactionInterceptor} from "../common/interceptor/ws-transaction.interceptor";
import {BadRequestException, UseInterceptors} from "@nestjs/common";
import {WsQueryRunner} from "../common/decorator/ws-query-runner.decorator";

@WebSocketGateway({
    namespace: '/chat',
    cors: {origin: '*', credentials: true}
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(
        private readonly chatService: ChatService,
        private readonly authService: AuthService,
    ) {
    }

    // ───────────────────────── 연결/해제 ─────────────────────────
    async handleConnection(client: Socket) {
        try {
            const rawToken = client.handshake.headers.authorization;
            if (!rawToken) return this.deny(client, 'Unauthorized: no token');

            // 너의 AuthService에 맞게 검증 함수 사용
            const payload = await this.authService.parseBearerToken(rawToken, false);

            client.data.user = payload; // { mbNo/sub, ... }
            this.chatService.registerClient(payload.sub ?? payload.mbNo, client);

            // 접속 직후엔 로비(개인 알림 룸)만 조인
            await this.chatService.joinLobby({sub: payload.sub ?? payload.mbNo}, client);

            // 프런트가 준비 신호를 받으면 목록 REST 로드 + join-room 호출
            client.emit('ready', {ok: true});
        } catch (e) {
            this.deny(client, 'Unauthorized: invalid token');
        }
    }

    handleDisconnect(client: Socket) {
        const user = client.data?.user;
        if (user) this.chatService.removeClient(user.sub ?? user.mbNo, client);
    }

    // ───────────────────────── 로비(사용자 룸) ─────────────────────────
    // 선택 이벤트: 프런트에서 명시적으로 부르고 싶다면 사용
    @SubscribeMessage('join-lobby')
    async joinLobby(@ConnectedSocket() client: Socket) {
        const user = client.data?.user;
        if (!user) return this.deny(client, 'Unauthorized');
        await this.chatService.joinLobby({sub: user.sub ?? user.mbNo}, client);
        client.emit('lobby:joined', {ok: true});
    }


    // ───────────────────────── 방 join/leave ─────────────────────────
    @SubscribeMessage('join-room')
    async joinRoom(@MessageBody() body: { roomId: number }, @ConnectedSocket() client: Socket) {
        const user = client.data?.user;
        if (!user) return this.deny(client, 'Unauthorized');

        // 멤버십 검증(서비스가 비즈로직 담당)
        await this.chatService.ensureJoinable(body.roomId, user.mbNo ?? user.sub);
        client.join(`room:${body.roomId}`);
        client.emit('room:joined', {roomId: body.roomId});

    }

    @SubscribeMessage('leave-room')
    async leaveRoom(@MessageBody() body: { roomId: number }, @ConnectedSocket() client: Socket) {
        client.leave(`room:${body.roomId}`);
        client.emit('room:left', {roomId: body.roomId});
    }

    // ───────────────────────── 메시지 전송 ─────────────────────────
    @SubscribeMessage('send-message')
    @UseInterceptors(WsTransactionInterceptor)
    async sendMessage(
        @MessageBody() body: CreateMessageDto,
        @ConnectedSocket() client: Socket,
        @WsQueryRunner() qr: QueryRunner,
    ) {
        const user = client.data?.user;
        if (!user) return this.deny(client, 'Unauthorized');
        if (!body?.roomId || !body?.message) throw new WsException('invalid payload');

        // 트랜잭션 내 비즈니스 수행
        const r = await this.chatService.createMessage(
            {sub: user.mbNo ?? user.sub},
            body,
            qr,
        );
        if (!r) return this.deny(client, 'Forbidden');


        // 방에 실시간 메시지 브로드캐스트
        this.server.to(`room:${r.roomId}`).emit('message:new', {...r.message, tempId: r.tempId});

        // 그룹 읽음 지표(마지막 메시지 기준 “안 읽은 사람 수”) 갱신
        this.server.to(`room:${r.roomId}`).emit('room:read-progress', {
            roomId: r.roomId,
            unreadMembers: r.groupUnreadMembers,
        });

        // 목록/배지 갱신 — 사용자 룸으로(요약을 함께 보내거나 poke만)
        for (const mbNo of r.notifyMembers) {
            // 트래픽이 크면 poke만 보내고 클라가 REST로 summary 재조회해도 됨
            this.server.to(`user:${mbNo}`).emit('room:update', {
                roomId: r.roomId,
                // 필요하면 myUnreadCount/lastMessage/lastMessageAt을 포함
            });
        }

        // ACK (클라에서 tempId로 pending→sent 전환)
        if (r.tempId) client.emit('message:ack', {tempId: r.tempId, id: (r.message as any).id});
    }

    // ───────────────────────── 읽음 커서 업데이트 ─────────────────────────
    @SubscribeMessage('cursor:update')
    @UseInterceptors(WsTransactionInterceptor)
    async updateCursor(
        @MessageBody() body: { roomId: number; lastReadMessageId?: string | number },
        @ConnectedSocket() client: Socket,
        @WsQueryRunner() qr: QueryRunner,
    ) {
        const user = client.data?.user;
        if (!user) return this.deny(client, 'Unauthorized');
        if (!body?.roomId) throw new BadRequestException('invalid payload');

        const r = await this.chatService.updateCursor(
            user.mbNo ?? user.sub,
            body.roomId,
            body.lastReadMessageId,
            qr,
        );

        // 내 목록 카드 갱신(개인 룸)
        this.server.to(`user:${user.mbNo ?? user.sub}`).emit('room:update', r.summaryForUser);

        // 그룹 읽음 지표 갱신(방 룸)
        this.server.to(`room:${body.roomId}`).emit('room:read-progress', {
            roomId: body.roomId,
            unreadMembers: r.groupUnreadMembers,
        });

        client.emit('cursor:ack', {roomId: body.roomId, lastReadMessageId: body.lastReadMessageId ?? null});
    }

    private deny(client: Socket, msg: string) {
        client.emit('error', msg);
        client.disconnect();
    }


}
