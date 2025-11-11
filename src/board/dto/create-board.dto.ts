import {IsBoolean, IsEmail, IsEnum, IsIn, IsNumber, IsOptional, IsString, IsUrl} from "class-validator";

export class CreateBoardDto {
    @IsOptional() @IsString() wrSubject: string;
    @IsString() wrContent: string;
    @IsOptional() @IsString() caName?: string;
    @IsOptional() @IsString() wrOption?: string;         // 'html1,secret,mail'
    @IsOptional() @IsString() wrLink1?: string;
    @IsOptional() @IsString() wrLink2?: string;
    @IsOptional() @IsString() wr1?: string;
}

export class CreateBoardReplyDto {
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