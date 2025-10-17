import {IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {MessageType} from "../entities/chat-message.entity";

export class CreateMessageDto {
  @IsOptional()
  @IsString()
  message: string;

  @IsNumber()
  @IsNotEmpty()
  room: number;

  @IsEnum(MessageType)
  @IsNotEmpty()
  messageType: MessageType;

  @IsOptional()
  @IsString()
  fileName: string;
}
