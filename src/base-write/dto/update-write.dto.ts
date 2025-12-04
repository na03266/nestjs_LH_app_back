import { PartialType } from '@nestjs/swagger';
import { CreateWriteDto } from './create-write.dto';
import {IsOptional} from "class-validator";

export class UpdateWriteDto extends PartialType(CreateWriteDto) {
    @IsOptional()
    keepFiles: number[];

    @IsOptional()
    newFiles: {
        savedName: string;
        originalName: string;
    }[];
}
