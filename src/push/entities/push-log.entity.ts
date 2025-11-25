import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn} from 'typeorm';

@Entity('push_logs')
@Index(['mbNo'])
@Index(['topic'])
export class PushLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: true})
    mbNo: number;

    @Column({nullable: true})
    token: string;

    @Column({nullable: true})
    topic: string;

    @Column()
    title: string;

    @Column()
    body: string;

    @Column({type: 'json', nullable: true})
    data: Record<string, any> | null;

    @Column({default: false})
    success: boolean;

    @Column({type: 'varchar', nullable: true})
    errorCode: string | null;

    @Column({type: 'text', nullable: true})
    errorMessage: string | null;

    @CreateDateColumn()
    sentAt: Date;

    @Column()
    readAt: boolean;
}