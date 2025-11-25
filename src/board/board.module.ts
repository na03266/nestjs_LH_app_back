import {Module} from '@nestjs/common';
import {BoardService} from './board.service';
import {BoardController} from './board.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {G5Board} from "./entities/g5-board.entity";

@Module({
    imports: [TypeOrmModule.forFeature([G5Board])],
    controllers: [BoardController],
    providers: [BoardService],
})
export class BoardModule {
}
