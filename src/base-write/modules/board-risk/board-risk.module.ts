// board-edu.module.ts (또는 board.module.ts 안에 함께)
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BoardRisk} from "./entity/board-risk.entity";
import {BoardFile} from "../../../file/entities/board_file.entity";
import {User} from "../../../user/entities/user.entity";
import {G5Board} from "../../../board/entities/g5-board.entity";
import {BoardRiskService} from "./board-risk.service";
import {CommonModule} from "../../../common/common.module";
import {BoardRiskController} from "./board-risk.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            BoardRisk,
            BoardFile,
            User,
            G5Board,
        ]),
        CommonModule,   // CommonService 제공
    ],
    controllers: [BoardRiskController],
    providers: [
        BoardRiskService,
    ],
    exports: [BoardRiskService],
})
export class BoardRiskModule {}
