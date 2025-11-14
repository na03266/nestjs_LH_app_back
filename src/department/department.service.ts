import {Injectable} from '@nestjs/common';
import {CreateDepartmentDto} from './dto/create-department.dto';
import {UpdateDepartmentDto} from './dto/update-department.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Department} from "./entities/department.entity";
import {Repository} from "typeorm";

@Injectable()
export class DepartmentService {
    constructor(
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>
    ) {
    }


    async findAll() {
        return await this.departmentRepository.find({
            relations: {parent: true}
        });
    }

    async findOne(id: number) {
        return await this.departmentRepository.find({
            where: {
                id
            },
            relations: {parent: true}
        });
    }

}
