import {ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength} from "class-validator";
import {Type} from "class-transformer";

export class CreateChatRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsArray()
  @IsNumber(
    {}, {
      each: true,
    },
  )
  @Type(() => Number)
  memberNos: number[];

  @IsOptional()
  @IsArray()
  @IsNumber(
    {}, {
      each: true,
    },
  )
  @Type(() => Number)
  teamNos: number[];
}