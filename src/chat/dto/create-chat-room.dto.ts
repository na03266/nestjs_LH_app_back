import {ArrayNotEmpty, IsArray, IsNumber, IsOptional, IsString} from "class-validator";
import {Type} from "class-transformer";

export class CreateChatDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber(
    {}, {
      each: true,
    },
  )
  @Type(() => Number)
  member: number[];
}