// board-edu.service.ts
import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {BoardSuggest} from "./entity/board-suggest.entity";
import {BoardFile} from "../../../file/entities/board_file.entity";
import {User} from "../../../user/entities/user.entity";
import {AbstractWriteService} from "../../abstract-write.service";
import {G5Board} from "../../../board/entities/g5-board.entity";
import {FileService} from "../../../common/file/file.service";
import {CommonService} from "../../../common/common.service";
import {ConfigService} from "@nestjs/config";
import {GetPostsDto} from "../../dto/get-posts.dto";


@Injectable()
export class BoardSuggestService extends AbstractWriteService<BoardSuggest> {
    // 이 보드가 사용하는 g5_write_* 의 bo_table 이름
    protected readonly boTable = 'comm20';

    constructor(
        @InjectRepository(BoardSuggest)
            boardRepo: Repository<BoardSuggest>,
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
    // 부모의 findAll을 재정의 (override 키워드 사용)
    override async findAll(dto: GetPostsDto) {
        const {title, caName, wr1} = dto;

        const qb = this.boardRepo
            .createQueryBuilder('post')
            .where('1=1');

        // 1) 기본 검색 조건 (부모 로직과 동일)
        if (title) {
            qb.andWhere('post.wrSubject LIKE :sub', {sub: `%${title}%`});
        }

        if (caName) {
            qb.andWhere('post.caName LIKE :ca', {ca: `%${caName}%`});
        }

        if (wr1) {
            qb.andWhere('post.wr1 LIKE :wr', {wr: `%${wr1}%`});
        }


        // 3) 공통 페이지네이션 + wrParent 조건 + 기본 정렬
        this.commonService.applyPagePaginationParamToQb(qb, dto);
        // 정렬 재설정: wr5(1,2,3,그 외) → wrDatetime DESC
        // wr5가 varchar라면 '1','2','3' 처럼 문자열, int라면 1,2,3으로 두면 됩니다.
        qb.orderBy(
            `CASE post.wr2 
         WHEN '접수' THEN 1   -- 접수
         WHEN '처리중' THEN 2   -- 처리중
         WHEN '완료' THEN 3   -- 완료
         ELSE 4            -- 그 외 값은 맨 뒤
       END`,
            'ASC',
        ).addOrderBy('post.wrDatetime', 'DESC');
        const [rows, count] = await qb.getManyAndCount();

        return {
            data: rows,
            meta: {
                count,
                page: dto.page ?? 1,
                take: dto.take ?? 10,
            },
        };
    }
}
