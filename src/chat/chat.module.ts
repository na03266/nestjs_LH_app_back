import {Module} from '@nestjs/common';
import {ChatService} from './chat.service';
import {ChatGateway} from './chat.gateway';
import {MessagesModule} from './messages/messages.module';
import {CursorModule} from './cursor/cursor.module';
import {ChatRoomModule} from "./chat-room/chat-room.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../user/entities/user.entity";
import {ChatRoom} from "./chat-room/entities/chat-room.entity";
import {AuthModule} from "../auth/auth.module";
import {ChatMessage} from "./messages/entities/chat-message.entity";
import {ChatCursor} from "./cursor/entities/chat-cursor.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ChatRoom, ChatMessage, ChatCursor]),
    ChatRoomModule,
    MessagesModule,
    CursorModule,
    AuthModule
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {
}
