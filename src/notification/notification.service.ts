import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationLog } from "./entities/notification.entity";
import { Repository, LessThan } from "typeorm";
import { NotificationReadLog } from "./entities/notification-read-log.entity";
import { Cron, CronExpression } from "@nestjs/schedule";



@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(NotificationLog)
        private readonly notificationRepo: Repository<NotificationLog>,
        @InjectRepository(NotificationReadLog)
        private readonly readLogRepo: Repository<NotificationReadLog>,
    ) {
    }

    async findAll(mbNo: number, isRead?: number) {
        const qb = this.notificationRepo.createQueryBuilder('noti');

        // 내 개별 알림 커거나 전체 발송 알림(mbNo is null)
        qb.where('(noti.mbNo = :mbNo OR noti.mbNo IS NULL)', { mbNo });

        // 읽음 처리 여부를 체크하기 위한 LEFT JOIN
        qb.leftJoin(
            NotificationReadLog,
            'nrl',
            'nrl.notificationId = noti.id AND nrl.mbNo = :mbNo',
            { mbNo }
        );

        // 프론트에서 expects 0 (안읽음), 1 (읽음)
        // 안읽음: 기존 개별 알림의 isRead가 false이고 AND nrl.id 가 NULL
        // 읽음: 기존 개별 알림의 isRead가 true이거나 OR nrl.id 가 NOT NULL
        if (isRead !== undefined) {
            if (Number(isRead) === 0) {
                qb.andWhere('(noti.isRead = false AND nrl.id IS NULL)');
            } else if (Number(isRead) === 1) {
                qb.andWhere('(noti.isRead = true OR nrl.id IS NOT NULL)');
            }
        }

        // sorting: isRead 순으로 (안읽은게 먼저) 정렬하기가 좀 까다롭습니다. 
        // IF(noti.isRead = true OR nrl.id IS NOT NULL, 1, 0)
        qb.addSelect('IF(noti.isRead = true OR nrl.id IS NOT NULL, 1, 0)', 'calculated_is_read')
        qb.orderBy('calculated_is_read', 'ASC')
            .addOrderBy('noti.sentAt', 'DESC');

        const [rawRows, count] = await qb.getManyAndCount();

        // 맵핑: select된 엔티티에 computed isRead 덮어쓰기
        // 사실 getMany()는 computed column을 매핑하지 않으므로 getRawAndEntities() 사용 혹은 개별 처리
        const { entities, raw } = await qb.getRawAndEntities();

        const data = entities.map((entity, index) => {
            const calculatedIsRead = raw[index].calculated_is_read === '1' || raw[index].calculated_is_read === 1;
            return {
                ...entity,
                isRead: calculatedIsRead
            };
        });

        return {
            data: data,
            count: count,
        };
    }

    async markAsRead(id: string, mbNo: number) {
        // 기존 개별 알림도 isRead true 처리
        await this.notificationRepo.update({ id, mbNo }, { isRead: true });

        // 읽음 로그 남기기 (전체 공지용 등)
        const exists = await this.readLogRepo.findOne({ where: { notificationId: id, mbNo } });
        if (!exists) {
            await this.readLogRepo.save({ notificationId: id, mbNo });
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCleanup() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 7일 지난 알림 삭제 (CASCADE 설정으로 인해 NotificationReadLog도 자동 삭제됨)
        await this.notificationRepo.delete({
            sentAt: LessThan(sevenDaysAgo)
        });
    }

    remove(id: number) {
        return `This action removes a #${id} notification`;
    }
}

