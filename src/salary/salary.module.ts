import {Module} from '@nestjs/common';
import {SalaryService} from './salary.service';
import {SalaryController} from './salary.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Salary} from "./entities/salary.entity";
import {User} from "../user/entities/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Salary, User]),
    ],
    controllers: [SalaryController],
    providers: [SalaryService],
})
export class SalaryModule {
}
