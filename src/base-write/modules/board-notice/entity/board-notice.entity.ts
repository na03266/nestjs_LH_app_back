// board-notice.entity.ts
import { Entity } from 'typeorm';
import {BaseBoard} from "../../../entities/base-board.entity";

@Entity({ name: 'g5_write_comm08' })
export class BoardNotice extends BaseBoard {}
