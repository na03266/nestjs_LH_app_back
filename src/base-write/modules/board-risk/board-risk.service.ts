// board-edu.service.ts
import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {BoardRisk} from "./entity/board-risk.entity";
import {BoardFile} from "../../../file/entities/board_file.entity";
import {User} from "../../../user/entities/user.entity";
import {AbstractWriteService} from "../../abstract-write.service";
import {G5Board} from "../../../board/entities/g5-board.entity";
import {FileService} from "../../../common/file/file.service";
import {CommonService} from "../../../common/common.service";
import {ConfigService} from "@nestjs/config";
import {GetPostsDto} from "../../dto/get-posts.dto";


@Injectable()
export class BoardRiskService extends AbstractWriteService<BoardRisk> {
    // 이 보드가 사용하는 g5_write_* 의 bo_table 이름
    protected readonly boTable = 'comm21';

    constructor(
        @InjectRepository(BoardRisk)
            boardRepo: Repository<BoardRisk>,
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
    override async findAll(dto: GetPostsDto) {
        const nextDto: GetPostsDto = {
            ...dto,
            // 예: caName이 안 들어왔으면 '위험성평가'를 기본값으로
            caName: dto.caName ?? '위험성평가',
            // wr1, wr2 등도 여기에서 강제 가능
        };

        // 부모의 findAll 쿼리 구조는 그대로 사용
        return super.findAll(nextDto);
    }
}
