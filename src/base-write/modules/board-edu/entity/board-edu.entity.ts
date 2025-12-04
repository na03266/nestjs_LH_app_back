// board-edu.entity.ts
import { Entity } from 'typeorm';
import {BaseBoard} from "../../../entities/base-board.entity";

@Entity({ name: 'g5_write_comm22' })
export class BoardEdu extends BaseBoard {}
