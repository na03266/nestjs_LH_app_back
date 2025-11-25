import {Injectable} from '@nestjs/common';
import {CreateDepartmentDto} from './dto/create-department.dto';
import {UpdateDepartmentDto} from './dto/update-department.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Department} from "./entities/department.entity";
import {IsNull, Not, Repository} from "typeorm";
import {User} from "../user/entities/user.entity";
import {IsEmpty} from "class-validator";
import {GetDepartmentDto} from "./dto/get-department.dto";
import {DepartmentDto} from "./dto/department.dto";
import {number} from "joi";

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

        // 1. 전체 부서 + parent + members만 조회 (children은 안 불러옴)
        const depts = await this.departmentRepository.find({
            relations: {
                parent: true,
                members: true,
            },
            order: {
                depth: 'ASC',
                id: 'ASC',
            },
        });
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

        return {data: result};
    }

    async findOne(id: number) {
        const result = await this.departmentRepository.findOne({
            where: {id},
            relations: {
                members: true,
                parent: {
                    parent: true,           // 부모의 부모까지 로딩
                },
                children: {
                    members: true,
                    children: true,
                },
            },
        });

        if (!result) {
            // 필요시 NotFoundException 등
            return null;
        }

        const grandParentId = result.parent?.parent?.id ?? null;
        const parentId = result.parent?.id ?? null;

        return {
            // 먼저 엔티티 속성들을 펼치고
            ...result,

            // 그 위에 우리가 원하는 커스텀 필드를 덮어씀
            grandParentId,
            parentId,
            isMb: (result.members?.length ?? 0) > 0,
            children: id === 1
                ? []
                : (result.children.map((e) => {
                    return {
                        ...e,
                        isMb: e.members.length !== 0,
                    }
                }) ?? []),
        };
    }

}
