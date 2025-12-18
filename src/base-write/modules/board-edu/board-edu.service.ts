// board-edu.service.ts
import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Brackets, In, Repository} from 'typeorm';
import {BoardEdu} from "./entity/board-edu.entity";
import {BoardFile} from "../../../file/entities/board_file.entity";
import {User} from "../../../user/entities/user.entity";
import {AbstractWriteService} from "../../abstract-write.service";
import {G5Board} from "../../../board/entities/g5-board.entity";
import {FileService} from "../../../common/file/file.service";
import {CommonService} from "../../../common/common.service";
import {ConfigService} from "@nestjs/config";
import {GetPostsDto} from "../../dto/get-posts.dto";


@Injectable()
export class BoardEduService extends AbstractWriteService<BoardEdu> {
    // 이 보드가 사용하는 g5_write_* 의 bo_table 이름
    protected readonly boTable = 'comm22';

    constructor(
        @InjectRepository(BoardEdu)
            boardRepo: Repository<BoardEdu>,
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
    override async findAll(dto: GetPostsDto, mbNo: number) {
        const {title, caName, wr1,} = dto;

        const me = await this.findMember(mbNo);

        const qb = this.boardRepo
            .createQueryBuilder('post')
            .where('1=1');

        qb.andWhere(
            new Brackets((q) => {
                q.where('post.mbId LIKE :mbId', {mbId: `%${me.mbId}%`})
                    .orWhere('post.wr6 LIKE :deptId', {deptId: `%${me.deptSite?.id}%`})
                    .orWhere('post.wr7 LIKE :mbNo', {mbNo: `%${mbNo}%`})
                    .orWhere('post.wrOption Not LIKE :secret', {secret: '%secret%'})
            }),
        );

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

    async findMembersFromString(wr6: string, wr7: string) {
        const teamNos = (wr6 ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => Number(s))
            .filter((n) => Number.isFinite(n) && n > 0);

        const directMemberNos = (wr7 ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => Number(s))
            .filter((n) => Number.isFinite(n) && n > 0);

        // 1) 팀 멤버들 가져오기
        let teamMemberNos: number[] = [];
        if (teamNos.length > 0) {
            const rows = await this.userRepo.find({
                where: {deptSite: In(teamNos)} as any,
                select: ['mbNo'] as any,
            });
            teamMemberNos = rows.map((r) => Number((r as any).mbNo)).filter((n) => Number.isFinite(n));
        }

        // 2) 합치고 중복 제거
        const unique = Array.from(new Set<number>([...teamMemberNos, ...directMemberNos]));

        return unique;
    }
}
