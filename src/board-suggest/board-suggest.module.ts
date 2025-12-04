import { Module } from '@nestjs/common';
import { BoardSuggestService } from './board-suggest.service';
import { BoardSuggestController } from './board-suggest.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {BoardFile} from "../file/entities/board_file.entity";
import {User} from "../user/entities/user.entity";
import {G5Board} from "../board/entities/g5-board.entity";
import {CommonModule} from "../common/common.module";
import {BoardSuggest} from "./entities/board-suggest.entity";

@Module({
  imports: [TypeOrmModule.forFeature([BoardSuggest, BoardFile, User, G5Board]), CommonModule],
  controllers: [BoardSuggestController],
  providers: [BoardSuggestService],
})
export class BoardSuggestModule {}
