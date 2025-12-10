import {IsNotEmpty, IsString} from "class-validator";
import {PartialType} from "@nestjs/mapped-types";
import {CreateChatRoomDto} from "./create-chat-room.dto";

export class UpdateRoomDto extends PartialType(CreateChatRoomDto) {
  @IsString()
  @IsNotEmpty()
  name: string;
}
