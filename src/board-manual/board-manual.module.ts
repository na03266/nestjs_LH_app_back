import {Module} from '@nestjs/common';
import {BoardManualService} from './board-manual.service';
import {BoardManualController} from './board-manual.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {BoardFile} from "../file/entities/board_file.entity";
import {User} from "../user/entities/user.entity";
import {G5Board} from "../board/entities/g5-board.entity";
import {CommonModule} from "../common/common.module";
import {BoardManual} from "./entities/board-manual.entity";

@Module({
    imports: [TypeOrmModule.forFeature([BoardManual, BoardFile, User, G5Board]), CommonModule],
    controllers: [BoardManualController],
    providers: [BoardManualService],
})
export class BoardManualModule {
}
