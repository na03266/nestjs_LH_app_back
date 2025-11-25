import {ClassSerializerInterceptor, Controller, Get, Param, Query, UseInterceptors} from '@nestjs/common';
import {DepartmentService} from './department.service';


@UseInterceptors(ClassSerializerInterceptor)
@Controller('department')
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) {
    }

    @Get()
    findAll(
    ) {
        return this.departmentService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.departmentService.findOne(+id);
    }
}
