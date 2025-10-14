import {ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString, MaxLength} from "class-validator";
import {Type} from "class-transformer";

export class CreateChatRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber(
    {}, {
      each: true,
    },
  )
  @Type(() => Number)
  memberNos: number[];
}