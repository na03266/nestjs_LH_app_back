import {IsString, IsObject, IsOptional, IsNumber} from 'class-validator';
export class SendToUserDto {
  @IsNumber() mbNo: number;
  @IsString() title: string;
  @IsString() body: string;
  @IsOptional() @IsObject() data?: Record<string, string>;
}