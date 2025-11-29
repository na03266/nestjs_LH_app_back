import {ArrayNotEmpty, IsInt, IsOptional, IsString, Max, Min, ValidateNested} from "class-validator";
import {Type} from "class-transformer";

export class JoinSurveyDTO {
    @ArrayNotEmpty()
    @ValidateNested({each: true})
    @Type(() => SurveyAnswerItemDto)
    answers: SurveyAnswerItemDto[];
}

export class SurveyAnswerItemDto {
    // 질문 ID (g5_survey_questions.sq_id)
    @IsInt()
    sqId: number;

    // 단일 선택 (radio, radio_text 등)
    @IsOptional()
    @IsInt()
    soId: number;

    // 텍스트 답변 (text / radio_text / checkbox 직접입력 등)
    @IsOptional()
    @IsString()
    text: string;

    // 별점 (rating: 1~5)
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    saRating: number;
}