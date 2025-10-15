import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class UpdateRoomDto {
  @IsNotEmpty()
  @IsNumber()
  roomId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
