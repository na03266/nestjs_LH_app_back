import { Controller } from '@nestjs/common';
import { BoardSuggestService } from './board-suggest.service';
import {AbstractWriteController} from "../../abstract-write.controller";

@Controller('board-suggest')
export class BoardSuggestController extends AbstractWriteController<BoardSuggestService> {
    constructor(service: BoardSuggestService) {
        super(service);
    }
}
