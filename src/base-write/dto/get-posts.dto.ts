import {PagePaginationDto} from "../../common/dto/page-pagination.dto";
import {IsOptional, IsString} from "class-validator";

export class GetPostsDto extends PagePaginationDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    wr1?: string;

    @IsOptional()
    @IsString()
    caName?: string;
}