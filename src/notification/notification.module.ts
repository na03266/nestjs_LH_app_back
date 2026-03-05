import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationLog } from "./entities/notification.entity";
import { NotificationReadLog } from "./entities/notification-read-log.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([NotificationLog, NotificationReadLog]),
    ],
    controllers: [NotificationController],
    providers: [NotificationService],
})
export class NotificationModule {
}
