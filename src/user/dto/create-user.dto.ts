import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  mbName: string;

  @IsNotEmpty()
  @IsString()
  mbPassword: string;

  @IsNotEmpty()
  @IsString()
  mbId: string;

  @IsOptional()
  @IsString()
  mb1: string;

  @IsOptional()
  @IsString()
  mb2: string;

  @IsOptional()
  @IsString()
  mb5: string;

  @IsOptional()
  @IsString()
  mbTel: string;

  @IsOptional()
  @IsString()
  mbHp: string;

  @IsOptional()
  @IsEmail()
  mbEmail: string;
}
