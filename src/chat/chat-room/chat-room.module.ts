import {Module} from '@nestjs/common';
import {ChatRoomService} from './chat-room.service';
import {ChatRoomController} from './chat-room.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../../user/entities/user.entity";
import {ChatCursor} from "../cursor/entities/chat-cursor.entity";
import {ChatRoom} from "./entities/chat-room.entity";
import {CommonModule} from "../../common/common.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRoom, User,
      ChatCursor,
    ]),
    CommonModule,
  ],
  controllers: [ChatRoomController],
  providers: [ChatRoomService],
})
export class ChatRoomModule {
}
