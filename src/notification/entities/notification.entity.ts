import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class NotificationLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({nullable: true})
    mbNo: number;
    @Column()
    title: string;
    @Column()
    body: string;
    @Column({type: 'json', nullable: true})
    data: Record<string, any> | null;

    @CreateDateColumn()
    sentAt: Date;
    @Column({default: false})
    isRead: boolean;
}
