import {IsArray, IsOptional, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
export class BoardFileDto {
    @IsString()
    savedName: string;        // temp 저장된 파일명

    @IsString()
    originalName: string;     // 실제 파일명
}

export class CreateWriteDto {
    @IsOptional() @IsString() wrSubject: string;
    @IsString() wrContent: string;
    @IsOptional() @IsString() caName?: string;
    @IsOptional() @IsString() wrOption?: string;         // 'html1,secret,mail'
    @IsOptional() @IsString() wrLink1?: string;
    @IsOptional() @IsString() wrLink2?: string;
    @IsOptional() @IsString() wr1?: string;
    @IsOptional() @IsString() wr2?: string;
    @IsOptional() @IsString() wr3?: string;
    @IsOptional() @IsString() wr4?: string;
    @IsOptional() @IsString() wr5?: string;
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BoardFileDto)
    files?: BoardFileDto[];
}

export class CreateWriteReplyDto {
    @IsString() wrSubject: string;
    @IsString() wrContent: string;
    @IsOptional() @IsString() wrOption?: string;         // 'html1,secret,mail'
    @IsOptional() @IsString() wrLink1?: string;
    @IsOptional() @IsString() wrLink2?: string;
}

export class CreateCommentDto {
    @IsString() wrContent: string;
    @IsOptional() @IsString() wrOption?: string; // csv: 'secret' 등
}