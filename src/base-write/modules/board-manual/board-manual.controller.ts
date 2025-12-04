import { Controller } from '@nestjs/common';
import { BoardManualService } from './board-manual.service';
import {AbstractWriteController} from "../../abstract-write.controller";

@Controller('board-manual')
export class BoardManualController extends AbstractWriteController<BoardManualService> {
    constructor(service: BoardManualService) {
        super(service);
    }
}
