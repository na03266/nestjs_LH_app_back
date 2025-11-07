import {Entity} from "typeorm";
import {BaseBoard} from "../../board/entities/board.entity";


@Entity({name: 'g5_write_comm08'})
export class BoardNotice extends BaseBoard {
}

