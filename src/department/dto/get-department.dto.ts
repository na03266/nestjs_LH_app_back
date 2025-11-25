import {CursorPaginationDto} from "../../common/dto/cursor-pagination.dto";
import {IsOptional, IsString} from "class-validator";

export class GetDepartmentDto extends CursorPaginationDto {
    @IsOptional()
    @IsString()
    name?: string;
}
