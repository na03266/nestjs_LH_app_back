import { Module } from '@nestjs/common';
import { BoardRiskService } from './board-risk.service';
import { BoardRiskController } from './board-risk.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {BoardNotice} from "../board-notice/entities/board-notice.entity";
import {BoardFile} from "../file/entities/board_file.entity";
import {User} from "../user/entities/user.entity";
import {G5Board} from "../board/entities/g5-board.entity";
import {CommonModule} from "../common/common.module";
import {BoardRisk} from "./entities/board-risk.entity";

@Module({
  imports: [TypeOrmModule.forFeature([BoardRisk, BoardFile, User, G5Board]), CommonModule],

  controllers: [BoardRiskController],
  providers: [BoardRiskService],
})
export class BoardRiskModule {}
