import {Module} from '@nestjs/common';
import {BoardNoticeService} from './board-notice.service';
import {BoardNoticeController} from './board-notice.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {BoardNotice} from "./entities/board-notice.entity";
import {BoardFile} from "../file/entities/board_file.entity";
import {User} from "../user/entities/user.entity";
import {G5Board} from "../board/entities/g5-board.entity";
import {CommonModule} from "../common/common.module";

@Module({
    imports: [TypeOrmModule.forFeature([BoardNotice, BoardFile, User, G5Board]), CommonModule],
    controllers: [BoardNoticeController],
    providers: [BoardNoticeService],
})
export class BoardNoticeModule {
}
