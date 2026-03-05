import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { NotificationLog } from "./notification.entity";

@Entity()
@Index(["mbNo", "notificationId"], { unique: true })
export class NotificationReadLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    mbNo: number;

    @Column('uuid')
    notificationId: string;

    @ManyToOne(() => NotificationLog, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'notificationId' })
    notification: NotificationLog;


    @CreateDateColumn()
    readAt: Date;
}

