// board-edu.module.ts (또는 board.module.ts 안에 함께)
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BoardSuggest} from "./entity/board-suggest.entity";
import {BoardFile} from "../../../file/entities/board_file.entity";
import {User} from "../../../user/entities/user.entity";
import {G5Board} from "../../../board/entities/g5-board.entity";
import {BoardSuggestService} from "./board-suggest.service";
import {CommonModule} from "../../../common/common.module";
import {BoardSuggestController} from "./board-suggest.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            BoardSuggest,
            BoardFile,
            User,
            G5Board,
        ]),
        CommonModule,   // CommonService 제공
    ],
    controllers: [BoardSuggestController],
    providers: [
        BoardSuggestService,
    ],
    exports: [BoardSuggestService],
})
export class BoardSuggestModule {
}
