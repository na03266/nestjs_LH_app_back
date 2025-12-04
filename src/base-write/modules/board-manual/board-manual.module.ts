// board-edu.module.ts (또는 board.module.ts 안에 함께)
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BoardManual} from "./entity/board-manual.entity";
import {BoardFile} from "../../../file/entities/board_file.entity";
import {User} from "../../../user/entities/user.entity";
import {G5Board} from "../../../board/entities/g5-board.entity";
import {BoardManualService} from "./board-manual.service";
import {CommonModule} from "../../../common/common.module";
import {BoardManualController} from "./board-manual.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            BoardManual,
            BoardFile,
            User,
            G5Board,
        ]),
        CommonModule,   // CommonService 제공
    ],
    controllers: [BoardManualController],
    providers: [
        BoardManualService,
    ],
    exports: [BoardManualService],
})
export class BoardManualModule {}
