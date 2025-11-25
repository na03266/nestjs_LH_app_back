import {Injectable} from '@nestjs/common';
import {CreateBoardDto} from './dto/create-board.dto';
import {UpdateBoardDto} from './dto/update-board.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {G5Board} from "./entities/g5-board.entity";
import {Repository} from "typeorm";

@Injectable()
export class BoardService {
    constructor(
        @InjectRepository(G5Board)
        private readonly boardRepository: Repository<G5Board>,
    ) {
    }

    create(createBoardDto: CreateBoardDto) {
        return 'This action adds a new board';
    }

    async findAll() {

        return {items: await this.boardRepository.find()};
    }

    findOne(id: string) {
        return this.boardRepository.findOne({
            where: {
                boTable: id
            }
        })
    }

    update(id: number, updateBoardDto: UpdateBoardDto) {
        return `This action updates a #${id} board`;
    }

    remove(id: number) {
        return `This action removes a #${id} board`;
    }
}
