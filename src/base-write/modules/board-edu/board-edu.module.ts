// board-edu.module.ts (또는 board.module.ts 안에 함께)
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BoardEdu} from "./entity/board-edu.entity";
import {BoardFile} from "../../../file/entities/board_file.entity";
import {User} from "../../../user/entities/user.entity";
import {G5Board} from "../../../board/entities/g5-board.entity";
import {BoardEduService} from "./board-edu.service";
import {CommonModule} from "../../../common/common.module";
import {BoardEduController} from "./board-edu.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            BoardEdu,
            BoardFile,
            User,
            G5Board,
        ]),
        CommonModule,   // CommonService 제공
    ],
    controllers: [BoardEduController],
    providers: [
        BoardEduService,
    ],
    exports: [BoardEduService],
})
export class BoardEduModule {}
