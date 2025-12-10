// get-messages.dto.ts
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import {CursorPaginationDto} from "../../../common/dto/cursor-pagination.dto";

export class GetMessagesDto extends CursorPaginationDto {
    @IsInt()
    @Type(() => Number)
    roomId: number;
}
