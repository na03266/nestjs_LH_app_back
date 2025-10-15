import {OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway} from '@nestjs/websockets';
import {ChatService} from './chat.service';
import {AuthService} from "../auth/auth.service";

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {
  }

  handleDisconnect(client: any) {
    const user = client.data.user;

    if (user) {
      this.chatService.removeClient(user.sub);
    }
    return;
  }

  async handleConnection(client: any, ...args: any[]) {
    try {
      const rawToken = client.handshake.headers.authorization;

      const payload = await this.authService.parseBearerToken(rawToken, false);
      if (payload) {
        client.data.user = payload;
        this.chatService.registerClient(payload.sub, client);
        await this.chatService.joinUserRooms(payload, client);
      } else {
        client.disconnect();
      }
    } catch (e) {
      console.log(e);
      client.disconnect();
    }
  }



}
