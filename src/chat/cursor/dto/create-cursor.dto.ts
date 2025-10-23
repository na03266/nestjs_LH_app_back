import {IsNotEmpty, IsNumber} from "class-validator";

export class CreateCursorDto {
  @IsNumber()
  @IsNotEmpty()
  userNo: number;

  @IsNumber()
  @IsNotEmpty()
  roomId: number;
}
