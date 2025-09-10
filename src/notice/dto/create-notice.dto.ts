import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateNoticeDto {
  @IsNotEmpty()
  @IsString()
  wrSubject: string;

  @IsNotEmpty()
  @IsString()
  wrContent: string;

  @IsOptional()
  @IsString()
  wrName: string;

  @IsOptional()
  @IsString()
  wrEmail: string;

  @IsOptional()
  @IsString()
  wrHomepage: string;

  @IsOptional()
  @IsString()
  wrOption: string;
}
