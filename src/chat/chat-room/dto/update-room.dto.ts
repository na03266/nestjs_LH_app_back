import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class UpdateRoomDto {
  @IsNotEmpty()
  @IsNumber()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
