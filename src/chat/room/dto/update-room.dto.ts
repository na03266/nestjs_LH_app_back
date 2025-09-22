import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDto } from './create-room.dto';
import {IsUUID} from "class-validator";

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  @IsUUID()
  roomId!: string;
}
