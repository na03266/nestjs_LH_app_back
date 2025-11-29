import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';
import {SurveyQuestion} from "./survey-question.entity";
import {Exclude} from "class-transformer";

@Entity('g5_poll')
export class Survey {
    @PrimaryGeneratedColumn({name: 'po_id', type: 'int'})
    poId: number;

    @Column({name: 'po_subject', type: 'varchar', length: 255, default: ''})
    poSubject: string;

    @Column({name: 'po_content', type: 'text', nullable: true})
    poContent?: string | null;

    @Exclude()
    @Column({name: 'po_poll1', type: 'varchar', length: 255, default: ''})
    poPoll1: string;

    @Exclude()
    @Column({name: 'po_poll2', type: 'varchar', length: 255, default: ''})
    poPoll2: string;

    @Exclude()
    @Column({name: 'po_poll3', type: 'varchar', length: 255, default: ''})
    poPoll3: string;

    @Exclude()
    @Column({name: 'po_poll4', type: 'varchar', length: 255, default: ''})
    poPoll4: string;

    @Exclude()
    @Column({name: 'po_poll5', type: 'varchar', length: 255, default: ''})
    poPoll5: string;

    @Exclude()
    @Column({name: 'po_poll6', type: 'varchar', length: 255, default: ''})
    poPoll6: string;

    @Exclude()
    @Column({name: 'po_poll7', type: 'varchar', length: 255, default: ''})
    poPoll7: string;

    @Exclude()
    @Column({name: 'po_poll8', type: 'varchar', length: 255, default: ''})
    poPoll8: string;

    @Exclude()
    @Column({name: 'po_poll9', type: 'varchar', length: 255, default: ''})
    poPoll9: string;

    @Exclude()
    @Column({name: 'po_poll10', type: 'varchar', length: 255, default: ''})
    poPoll10: string;

    @Column({name: 'po_cnt1', type: 'int', default: 0})
    poCnt1: number;

    @Exclude()
    @Column({name: 'po_cnt2', type: 'int', default: 0})
    poCnt2: number;

    @Exclude()
    @Column({name: 'po_cnt3', type: 'int', default: 0})
    poCnt3: number;

    @Exclude()
    @Column({name: 'po_cnt4', type: 'int', default: 0})
    poCnt4: number;

    @Exclude()
    @Column({name: 'po_cnt5', type: 'int', default: 0})
    poCnt5: number;

    @Exclude()
    @Column({name: 'po_cnt6', type: 'int', default: 0})
    poCnt6: number;

    @Exclude()
    @Column({name: 'po_cnt7', type: 'int', default: 0})
    poCnt7: number;

    @Exclude()
    @Column({name: 'po_cnt8', type: 'int', default: 0})
    poCnt8: number;

    @Exclude()
    @Column({name: 'po_cnt9', type: 'int', default: 0})
    poCnt9: number;

    @Exclude()
    @Column({name: 'po_cnt10', type: 'int', default: 0})
    poCnt10: number;

    @Exclude()
    @Column({name: 'po_etc', type: 'varchar', length: 255, default: ''})
    poEtc: string;

    @Column({name: 'po_level', type: 'tinyint', default: 0})
    poLevel: number;

    @Exclude()
    @Column({name: 'po_point', type: 'int', default: 0})
    poPoint: number;

    @Column({name: 'po_date', type: 'date'})
    poDate: Date;

    @Column({name: 'po_date_end', type: 'date', nullable: true})
    poDateEnd?: Date | null;

    @Column({
        name: 'po_is_survey',
        type: 'tinyint',
        width: 1,
        default: 0,
        comment: '설문조사 여부',
    })
    poIsSurvey: number; // 필요하면 boolean + transformer로 변경 가능

    @Exclude()
    @Column({name: 'po_ips', type: 'mediumtext'})
    poIps: string;

    @Exclude()
    @Column({name: 'mb_ids', type: 'text'})
    mbIds: string;

    @OneToMany(
        () => SurveyQuestion,
        (question) => question.survey,
    )
    questions: SurveyQuestion[];
}
