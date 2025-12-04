// board-notice.module.ts (또는 board.module.ts 안에 함께)
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BoardNotice} from "./entity/board-notice.entity";
import {BoardFile} from "../../../file/entities/board_file.entity";
import {User} from "../../../user/entities/user.entity";
import {G5Board} from "../../../board/entities/g5-board.entity";
import {BoardNoticeService} from "./board-notice.service";
import {CommonModule} from "../../../common/common.module";
import {BoardNoticeController} from "./board-notice.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            BoardNotice,
            BoardFile,
            User,
            G5Board,
        ]),
        CommonModule,   // CommonService 제공
    ],
    controllers: [BoardNoticeController],
    providers: [
        BoardNoticeService,
    ],
    exports: [BoardNoticeService],
})
export class BoardNoticeModule {}
