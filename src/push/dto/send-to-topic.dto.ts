import { IsString, IsObject, IsOptional } from 'class-validator';
export class SendToTopicDto {
  @IsString() topic: string;
  @IsString() title: string;
  @IsString() body: string;
  @IsOptional() @IsObject() data?: Record<string, string>;
}