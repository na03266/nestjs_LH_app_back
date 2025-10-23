import {IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {MessageType} from "../entities/chat-message.entity";

export class CreateMessageDto {
  @IsNumber()
  @IsNotEmpty()
  roomId: number;

  @IsOptional()
  @IsString()
  message: string;

  @IsEnum(MessageType)
  @IsNotEmpty()
  messageType: MessageType;

  @IsOptional()
  @IsString()
  fileName: string;
}
