import {PartialType} from '@nestjs/swagger';
import {CreateWriteDto} from './create-write.dto';
import {IsArray, IsOptional, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";

class FileDto {
    @IsString()
    savedName: string;
    @IsString()
    originalName: string;
}

export class UpdateWriteDto extends PartialType(CreateWriteDto) {
    @IsOptional()
    keepFiles: number[];

    @IsOptional()
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => FileDto)
    newFiles?: FileDto[];
}
