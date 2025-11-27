import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Salary} from "./entities/salary.entity";
import {Repository} from "typeorm";
import {User} from "../user/entities/user.entity";

import {renderSalaryHtml} from "./salary.template";        // ← 이 형식이 되어야 합니다.

@Injectable()
export class SalaryService {
    constructor(
        @InjectRepository(Salary)
        private readonly salaryRepository: Repository<Salary>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
    }

    async findMe(mbNo: number) {
        const me = await this.userRepository.findOne({where: {mbNo}});
        if (!me) throw new NotFoundException('사용자정보를 찾을 수 없습니다.');
        return me;
    }

    async findAll(mbNo: number, year?: number) {
        const me = this.findMe(mbNo);

        // 1) 이 사용자(mbNo)에 대한 연도 목록 조회
        const yearRows = await this.salaryRepository
            .createQueryBuilder('s')
            .select('DISTINCT s.sa_year', 'year')
            .where('s.sa_mbid = :mbId', {mbId: '9000102'}) // 실제 컬럼에 맞게 변환
            .orderBy('s.sa_year', 'DESC')
            .getRawMany<{ year: number }>();

        const years = yearRows.map((r) => Number(r.year));

        if (years.length === 0) {
            return {years: [], data: []};
        }

        // 2) year 쿼리가 없으면 가장 최근 연도로 자동 설정
        const targetYear = year ?? years[0];

        // 3) 해당 연도의 월별 급여 데이터 조회
        const rows = await this.salaryRepository
            .createQueryBuilder('s')
            .select([
                's.sa_year  AS year',
                's.sa_month AS month',
                's.sa_id    AS saId',
            ])
            .where('s.sa_mbid = :mbId', {mbId: '9000102'})
            .andWhere('s.sa_year = :year', {year: targetYear})
            .orderBy('s.sa_month', 'DESC')
            .getRawMany<{
                year: number;
                month: number;
                saId: number;
            }>();

        const data = rows.map((r) => ({
            year: Number(r.year),
            month: Number(r.month),
            saId: Number(r.saId),
        }));

        return {
            years,     // [2025, 2024, ...]
            data,      // 기본값: targetYear(가장 최근 or 선택 연도)의 월 리스트
        };
    }

    async generateSalaryHtml(mbNo: number, saId: number) {
        const salary = await this.salaryRepository.findOne({where: {sa_id: saId}});
        if (!salary) throw new NotFoundException('급여 데이터를 찾을 수 없습니다.');

        const member = await this.findMe(mbNo);
        return renderSalaryHtml(salary, member);
    }
}
