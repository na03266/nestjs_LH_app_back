import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Department } from "./entities/department.entity";
import { Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { DepartmentDto } from "./dto/department.dto";

@Injectable()
export class DepartmentService {
    constructor(
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
        @InjectRepository(User)
        private readonly memberRepository: Repository<User>
    ) {
    }


    async findAll() {
        const rootId = 1;

        // 1. 전체 부서 + parent만 조회 (members는 별도로 필터링)
        const depts = await this.departmentRepository.find({
            relations: {
                parent: true,
            },
            order: {
                depth: 'ASC',
                id: 'ASC',
            },
        });

        // 2. 각 부서의 재직자만 조회 (mb10이 null이거나 빈 문자열)
        for (const dept of depts) {
            const membersQb = this.memberRepository.createQueryBuilder('member')
                .leftJoin('member.deptSite', 'deptSite')
                .where('deptSite.id = :deptId', { deptId: dept.id })
                .andWhere('(member.mb10 IS NULL OR member.mb10 = :emptyString)', { emptyString: '' });
            dept.members = await membersQb.getMany();
        }

        const dtoMap = new Map<number, DepartmentDto>();
        for (const d of depts) {
            dtoMap.set(d.id, {
                id: d.id,
                name: d.name,
                depth: d.id === rootId ? 0 : d.depth,           // 대표이사만 depth 0
                isMb: (d.members?.length ?? 0) > 0,             // members 있으면 true
                children: [],
            });
        }

        // 3. parent 기준으로 children 연결 (단, parent가 대표이사인 경우는 루트로 빼고 연결 X)
        for (const d of depts) {
            if (!d.parent) continue;                          // 대표이사(부모 없음)는 건너뜀

            // 대표이사의 직속 자식은 최상위 레벨에 보여야 하므로 children에 넣지 않음
            if (d.parent.id === rootId) {
                continue;
            }

            const parentDto = dtoMap.get(d.parent.id);
            const childDto = dtoMap.get(d.id);

            if (parentDto && childDto) {
                parentDto.children.push(childDto);
            }
        }

        // 4. 최상위에 올릴 노드 선택
        //    1) 대표이사
        //    2) 대표이사의 직속 자식들
        const result: DepartmentDto[] = [];

        for (const d of depts) {
            if (d.id === rootId || d.parent?.id === rootId) {
                const dto = dtoMap.get(d.id);
                if (dto) {
                    // 대표이사는 children 항상 []
                    if (dto.id === rootId) {
                        dto.children = [];
                    }
                    result.push(dto);
                }
            }
        }

        return { data: result };
    }

    async findOne(id: number) {
        const result = await this.departmentRepository.findOne({
            where: {
                id,
            },
            relations: {
                parent: { parent: true },
                children: { children: true },
            },
        });

        // members를 별도로 조회하여 mb10이 null이거나 빈 문자열인 경우만 가져오기
        if (result) {
            const membersQb = this.memberRepository.createQueryBuilder('member')
                .leftJoin('member.deptSite', 'deptSite')
                .where('deptSite.id = :deptId', { deptId: id })
                .andWhere('(member.mb10 IS NULL OR member.mb10 = :emptyString)', { emptyString: '' });
            result.members = await membersQb.getMany();

            // children의 members도 필터링
            if (result.children) {
                for (const child of result.children) {
                    const childMembersQb = this.memberRepository.createQueryBuilder('member')
                        .leftJoin('member.deptSite', 'deptSite')
                        .where('deptSite.id = :deptId', { deptId: child.id })
                        .andWhere('(member.mb10 IS NULL OR member.mb10 = :emptyString)', { emptyString: '' });
                    child.members = await childMembersQb.getMany();
                }
            }
        }

        if (!result) return null;

        const grandParentId = result.parent?.parent?.id ?? null;
        const parentId = result.parent?.id ?? null;

        // ✅ 멤버 이름순 정렬 함수 (빈 이름은 뒤로)
        const sortMembersByName = <T extends { mbName?: string | null; mbNo?: number }>(arr?: T[]) => {
            if (!arr) return [];
            return [...arr].sort((a, b) => {
                const an = (a.mbName ?? '').trim();
                const bn = (b.mbName ?? '').trim();

                if (!an && !bn) return (a.mbNo ?? 0) - (b.mbNo ?? 0);
                if (!an) return 1;  // 빈 이름 뒤로
                if (!bn) return -1;

                const cmp = an.localeCompare(bn, 'ko', { sensitivity: 'base', numeric: true });
                return cmp !== 0 ? cmp : (a.mbNo ?? 0) - (b.mbNo ?? 0);
            });
        };

        // ✅ 본인 부서 members 정렬
        const sortedMembers = sortMembersByName(result.members);

        // ✅ children의 members도 정렬 (필요 시 children.children까지 재귀로 확장 가능)
        const sortedChildren = id === 1
            ? []
            : (result.children ?? []).map((e) => ({
                ...e,
                members: sortMembersByName(e.members),
                isMb: (e.members?.length ?? 0) !== 0,
            }));

        return {
            ...result,
            grandParentId,
            parentId,
            isMb: (result.members?.length ?? 0) > 0,
            members: sortedMembers,     // ✅ 정렬된 멤버로 덮어쓰기
            children: sortedChildren,   // ✅ 정렬된 children 반영
        };
    }

}
