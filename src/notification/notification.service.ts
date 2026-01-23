import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {NotificationLog} from "./entities/notification.entity";
import {Repository} from "typeorm";

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(NotificationLog)
        private readonly notificationRepo: Repository<NotificationLog>,
    ) {
    }

    async findAll(mbNo: number, isRead?: number) {
        const qb = this.notificationRepo.createQueryBuilder('noti');

        qb.where('noti.mbNo = :mbNo', {mbNo});

        if (isRead) {
            qb.andWhere('noti.isRead = :isRead', {isRead});
        }
        qb.orderBy('noti.isRead', 'ASC')
          .addOrderBy('noti.sentAt', 'DESC');
        const [rows, count] = await qb.getManyAndCount();

        return {
            data: rows,
            count: count,
        };
    }

    async markAsRead(id: string) {
        await this.notificationRepo.update(
            {id},
            {isRead: true},
        );
    }

    remove(id: number) {
        return `This action removes a #${id} notification`;
    }
}
