import {Module} from '@nestjs/common';
import {ChatRoomService} from './chat-room.service';
import {ChatRoomController} from './chat-room.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Room} from "./entities/chat-room.entity";
import {RoomMember} from "./entities/room-member.entity";
import {User} from "../../user/entities/user.entity";
import {RoomReadCursor} from "../cursor/entities/room-read-cursor.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Room, RoomMember, User,
      RoomReadCursor,
    ])
  ],
  controllers: [ChatRoomController],
  providers: [ChatRoomService],
})
export class ChatRoomModule {
}
