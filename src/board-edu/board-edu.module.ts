import { Module } from '@nestjs/common';
import { BoardEduService } from './board-edu.service';
import { BoardEduController } from './board-edu.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {BoardNotice} from "../board-notice/entities/board-notice.entity";
import {BoardFile} from "../file/entities/board_file.entity";
import {User} from "../user/entities/user.entity";
import {G5Board} from "../board/entities/g5-board.entity";
import {CommonModule} from "../common/common.module";
import {BoardEdu} from "./entities/board-edu.entity";

@Module({
  imports: [TypeOrmModule.forFeature([BoardEdu, BoardFile, User, G5Board]), CommonModule],
  controllers: [BoardEduController],
  providers: [BoardEduService],
})
export class BoardEduModule {}
