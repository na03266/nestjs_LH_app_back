import {IsNotEmpty, IsString} from "class-validator";

export class UpdateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
