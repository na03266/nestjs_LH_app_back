import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatRoomModule } from './room/chat-room.module';
import { MessagesModule } from './messages/messages.module';
import { FilesModule } from './files/files.module';
import { CursorModule } from './cursor/cursor.module';

@Module({
  providers: [ChatGateway, ChatService],
  imports: [ChatRoomModule, MessagesModule, FilesModule, CursorModule],
})
export class ChatModule {}
