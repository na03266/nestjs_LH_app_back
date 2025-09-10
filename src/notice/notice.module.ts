import {Module} from '@nestjs/common';
import {NoticeService} from './notice.service';
import {NoticeController} from './notice.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Notice} from './entities/notice.entity';
import {CommonModule} from "../common/common.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Notice]),
    CommonModule,
  ],
  controllers: [NoticeController],
  providers: [NoticeService],
  exports: [NoticeService]
})
export class NoticeModule {
}
