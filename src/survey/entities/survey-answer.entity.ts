import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import {SurveyResponse} from "./survey-response.entity";
import {SurveyQuestion} from "./survey-question.entity";

@Index('sr_id', ['srId'])
@Index('sq_id', ['sqId'])
@Index('so_id', ['soId'])
@Entity('g5_survey_answers')
export class SurveyAnswer {
    @PrimaryGeneratedColumn({name: 'sa_id', type: 'int'})
    saId: number;

    @Column({
        name: 'sr_id',
        type: 'int',
        comment: '응답 ID',
    })
    srId: number;

    @Column({
        name: 'sq_id',
        type: 'int',
        comment: '질문 ID',
    })
    sqId: number;

    @Column({
        name: 'so_id',
        type: 'int',
        nullable: true,
        comment: '선택지 ID (객관식)',
    })
    soId?: number | null;

    @Column({
        name: 'sa_text',
        type: 'text',
        nullable: true,
        comment: '텍스트 답변 (주관식/ 직접입력)',
    })
    saText?: string | null;

    @Column({
        name: 'sa_rating',
        type: 'int',
        nullable: true,
        comment: '별점 (1-5)',
    })
    saRating?: number | null;

    @ManyToOne(() => SurveyResponse,)
    @JoinColumn({name: 'sr_id', referencedColumnName: 'srId'})
    response: SurveyResponse;

    @ManyToOne(() => SurveyQuestion,)
    @JoinColumn({name: 'sq_id', referencedColumnName: 'sqId'})
    question: SurveyQuestion;

}
