import { PartialType } from '@nestjs/swagger';
import { CreateBoardNoticeDto } from './create-board-notice.dto';

export class UpdateBoardNoticeDto extends PartialType(CreateBoardNoticeDto) {}
