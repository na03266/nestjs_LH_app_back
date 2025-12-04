import { Controller } from '@nestjs/common';
import { BoardEduService } from './board-edu.service';
import {AbstractWriteController} from "../../abstract-write.controller";

@Controller('board-edu')
export class BoardEduController extends AbstractWriteController<BoardEduService> {
    constructor(service: BoardEduService) {
        super(service);
    }
}
