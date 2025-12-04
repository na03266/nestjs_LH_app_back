import { Controller } from '@nestjs/common';
import { BoardRiskService } from './board-risk.service';
import {AbstractWriteController} from "../../abstract-write.controller";

@Controller('board-risk')
export class BoardRiskController extends AbstractWriteController<BoardRiskService> {
    constructor(service: BoardRiskService) {
        super(service);
    }
}
