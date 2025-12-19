import {IsArray, IsNumber, IsOptional} from "class-validator";
import {Type} from "class-transformer";

export class PassOnDepartmentDto {
    @IsOptional()
    @IsArray()
    @IsNumber(
        {}, {
            each: true,
        },
    )
    @Type(() => Number)
    memberNos: number[];

    @IsOptional()
    @IsArray()
    @IsNumber(
        {}, {
            each: true,
        },
    )
    @Type(() => Number)
    teamNos: number[];
}
