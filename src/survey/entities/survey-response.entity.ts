import {Column, Entity, PrimaryGeneratedColumn,} from 'typeorm';

@Entity('g5_survey_responses')
export class SurveyResponse {
    @PrimaryGeneratedColumn({ name: 'sr_id', type: 'int' })
    srId: number;

    @Column({
        name: 'po_id',
        type: 'int',
        comment: '설문 ID',
    })
    poId: number;

    @Column({
        name: 'mb_id',
        type: 'varchar',
        length: 20,
        comment: '회원 ID',
    })
    mbId: string;

    @Column({
        name: 'sr_ip',
        type: 'varchar',
        length: 50,
        comment: '응답 IP',
    })
    srIp: string;

    @Column({
        name: 'sr_datetime',
        type: 'datetime',
        comment: '응답 일시',
    })
    srDatetime: Date;

}
