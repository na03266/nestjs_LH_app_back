import { PartialType } from '@nestjs/mapped-types';
import {IsUUID} from "class-validator";
import {CreateChatRoomDto} from "./create-chat-room.dto";

export class UpdateRoomDto extends PartialType(CreateChatRoomDto) {
  @IsUUID()
  roomId!: string;
}
