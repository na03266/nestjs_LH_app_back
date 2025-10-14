import {Module} from '@nestjs/common';
import {ChatService} from './chat.service';
import {ChatGateway} from './chat.gateway';
import {MessagesModule} from './messages/messages.module';
import {FilesModule} from './files/files.module';
import {CursorModule} from './cursor/cursor.module';
import {ChatRoomModule} from "./chat-room/chat-room.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../user/entities/user.entity";
import {ChatRoom} from "./chat-room/entities/chat-room.entity";
import {Chat} from "./entities/chat.entity";
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ChatRoom, Chat]),
    ChatRoomModule,
    MessagesModule,
    FilesModule,
    CursorModule,
    AuthModule
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {
}
