import {IsEmail, IsIn, IsOptional, IsString, IsUrl} from "class-validator";

export class CreateBoardNoticeDto {
    @IsString() wr_subject: string;
    @IsString() wr_content: string;
    @IsOptional() @IsString() caName?: string;
    @IsOptional() @IsString() option?: string;         // 'html1,secret,mail'
    @IsOptional() @IsString() mbId?: string;
    @IsString() wr_name: string;
    @IsOptional() @IsString() wr_email?: string;
    @IsOptional() @IsString() wr_homepage?: string;
    @IsOptional() @IsString() wr_password_hash?: string;
    @IsOptional() @IsString() wr_1 = '';
    @IsOptional() @IsString() wr_2 = '';
    @IsOptional() @IsString() wr_3 = '';
    @IsOptional() @IsString() wr_4 = '';
    @IsOptional() @IsString() wr_5 = '';
    @IsOptional() @IsString() wr_6 = '';
    @IsOptional() @IsString() wr_7 = '';
    @IsOptional() @IsString() wr_8 = '';
    @IsOptional() @IsString() wr_9 = '';
    @IsOptional() @IsString() wr_10 = '';
}

export class CreateBoardNoticeReplyDto {
    @IsString()
    wr_subject: string;

    @IsString()
    wr_content: string;

    @IsOptional()
    @IsString()
    option?: string; // csv: 'html1,secret,mail'

    @IsOptional()
    @IsString()
    mb_id?: string;

    @IsString()
    wr_name: string;

    @IsOptional()
    @IsEmail()
    wr_email?: string;

    @IsOptional()
    @IsUrl()
    wr_homepage?: string;

    @IsOptional()
    @IsString()
    wr_password_hash?: string;

    @IsOptional()
    @IsIn(['0', '1'])
    inheritSecretPassword?: '0' | '1';
}
