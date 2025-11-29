// g5-survey-option.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import {SurveyQuestion} from "./survey-question.entity";

@Index('sq_id', ['sqId'])
@Index('so_order', ['soOrder'])
@Entity('g5_survey_options')
export class SurveyOption {
    @PrimaryGeneratedColumn({name: 'so_id', type: 'int'})
    soId: number;

    @Column({
        name: 'sq_id',
        type: 'int',
        comment: '질문 ID',
    })
    sqId: number;

    @Column({
        name: 'so_order',
        type: 'int',
        default: 0,
        comment: '선택지 순서',
    })
    soOrder: number;

    @Column({
        name: 'so_text',
        type: 'varchar',
        length: 255,
        comment: '선택지 텍스트',
    })
    soText: string;

    @Column({
        name: 'so_has_input',
        type: 'tinyint',
        width: 1,
        default: 0,
        comment: '직접입력 여부',
    })
    soHasInput: number; // 필요하면 boolean + transformer 로 변경 가능

    @ManyToOne(() => SurveyQuestion,
        (question) => question.options,)
    @JoinColumn({name: 'sq_id', referencedColumnName: 'sqId'})
    question: SurveyQuestion;
}
