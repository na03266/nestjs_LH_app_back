import {CreateCursorDto} from "./create-cursor.dto";
import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class UpdateCursorDto implements CreateCursorDto {
  @IsNumber()
  @IsNotEmpty()
  userNo: number;

  @IsNumber()
  @IsNotEmpty()
  roomId: number;

}
