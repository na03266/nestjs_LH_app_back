import { IsString, IsObject, IsOptional } from 'class-validator';
export class SendToUserDto {
  @IsString() mbNo: number;
  @IsString() title: string;
  @IsString() body: string;
  @IsOptional() @IsObject() data?: Record<string, string>;
}