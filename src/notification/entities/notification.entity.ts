import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@Index(['mbNo', 'sentAt'])
export class NotificationLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    mbNo: number | null;

    @Column()
    title: string;

    @Column()
    body: string;

    @Column({ type: 'json', nullable: true })
    data: Record<string, any> | null;

    @CreateDateColumn()
    sentAt: Date;

    @Column({ default: false })
    isRead: boolean;
}

