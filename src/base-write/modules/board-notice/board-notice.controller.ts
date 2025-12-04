import { Controller } from '@nestjs/common';
import { BoardNoticeService } from './board-notice.service';
import {AbstractWriteController} from "../../abstract-write.controller";

@Controller('board-notice')
export class BoardNoticeController extends AbstractWriteController<BoardNoticeService> {
    constructor(service: BoardNoticeService) {
        super(service);
    }
}
