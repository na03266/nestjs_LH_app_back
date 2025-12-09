// board-edu.service.ts
import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {BoardManual} from "./entity/board-manual.entity";
import {BoardFile} from "../../../file/entities/board_file.entity";
import {User} from "../../../user/entities/user.entity";
import {AbstractWriteService} from "../../abstract-write.service";
import {G5Board} from "../../../board/entities/g5-board.entity";
import {FileService} from "../../../common/file/file.service";
import {CommonService} from "../../../common/common.service";
import {ConfigService} from "@nestjs/config";


@Injectable()
export class BoardManualService extends AbstractWriteService<BoardManual> {
    // 이 보드가 사용하는 g5_write_* 의 bo_table 이름
    protected readonly boTable = 'comm10_1';

    constructor(
        @InjectRepository(BoardManual)
            boardRepo: Repository<BoardManual>,
        @InjectRepository(BoardFile)
            fileRepo: Repository<BoardFile>,
        @InjectRepository(User)
            userRepo: Repository<User>,
        @InjectRepository(G5Board)
            g5BoardRepo: Repository<G5Board>,
        fileService: FileService,
        commonService: CommonService,
        configService: ConfigService,
    ) {
        super(boardRepo, fileRepo, userRepo, g5BoardRepo, fileService, commonService, configService);
    }

    // 필요하면 여기서 개별 게시판만의 커스텀 메서드/오버라이드 추가
    // 예: findAll에 기본 caName 필터 강제 등
}
