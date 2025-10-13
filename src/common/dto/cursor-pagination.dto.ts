import { IsArray, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CursorPaginationDto {
  @IsString()
  @IsOptional()
  // id_52, likeCount_20
  @ApiProperty()
  cursor?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  // id_ASC id_DESC
  // [id_ASC, id_DESC]
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  order: string [] = ['id_DESC'];

  @IsInt()
  @IsOptional()
  take: number = 20;
}