import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {UserController} from './user.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {CommonModule} from "../common/common.module";
import {Department} from "../department/entities/department.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User,Department]),
    CommonModule
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {
}
