// board-edu.service.ts
import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';
import {BoardEdu} from "./entity/board-edu.entity";
import {BoardFile} from "../../../file/entities/board_file.entity";
import {User} from "../../../user/entities/user.entity";
import {AbstractWriteService} from "../../abstract-write.service";
import {G5Board} from "../../../board/entities/g5-board.entity";
import {FileService} from "../../../common/file/file.service";
import {CommonService} from "../../../common/common.service";
import {ConfigService} from "@nestjs/config";


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

    async findMembersFromString(wr6:string, wr7:string){
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
                where: { deptSite: In(teamNos) } as any,
                select: ['mbNo'] as any,
            });
            teamMemberNos = rows.map((r) => Number((r as any).mbNo)).filter((n) => Number.isFinite(n));
        }

        // 2) 합치고 중복 제거
        const unique = Array.from(new Set<number>([...teamMemberNos, ...directMemberNos]));

        return unique;
    }
}
