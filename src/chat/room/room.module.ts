import {Module} from '@nestjs/common';
import {RoomService} from './room.service';
import {RoomController} from './room.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Room} from "./entities/room.entity";
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
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {
}
