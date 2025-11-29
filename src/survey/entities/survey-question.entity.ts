import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,} from 'typeorm';
import {Survey} from "./survey.entity";
import {SurveyOption} from "./survey-option.entity";

@Entity('g5_survey_questions')
export class SurveyQuestion {
    @PrimaryGeneratedColumn({name: 'sq_id', type: 'int'})
    sqId: number;

    @Column({name: 'po_id', type: 'int', comment: '설문 ID'})
    poId: number;

    @Column({
        name: 'sq_order',
        type: 'int',
        default: 0,
        comment: '질문 순서',
    })
    sqOrder: number;

    @Column({
        name: 'sq_title',
        type: 'varchar',
        length: 255,
        comment: '질문 제목',
    })
    sqTitle: string;

    @Column({
        name: 'sq_type',
        type: 'varchar',
        length: 20,
        comment: '질문 타입: radio, checkbox, text, radio_text, rating',
    })
    sqType: string;

    @Column({
        name: 'sq_required',
        type: 'tinyint',
        width: 1,
        default: 0,
        comment: '필수 여부',
    })
    sqRequired: number; // 필요하면 boolean + transformer로 변경 가능

    @Column({
        name: 'sq_content',
        type: 'text',
        nullable: true,
        comment: '질문 설명',
    })
    sqContent?: string | null;

    @ManyToOne(
        () => Survey,
        (survey) => survey.questions,
    )
    @JoinColumn({name: 'po_id', referencedColumnName: 'poId'})
    survey: Survey;

    @OneToMany(
        () => SurveyOption, (option) => option.question
    )
    @JoinColumn({name: 'po_id', referencedColumnName: 'poId'})
    options: SurveyQuestion[];
}
