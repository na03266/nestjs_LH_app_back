import {Module} from '@nestjs/common';
import {SurveyService} from './survey.service';
import {SurveyController} from './survey.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Survey} from "./entities/survey.entity";
import {SurveyQuestion} from "./entities/survey-question.entity";
import {SurveyResponse} from "./entities/survey-response.entity";
import {SurveyOption} from "./entities/survey-option.entity";
import {SurveyAnswer} from "./entities/survey-answer.entity";
import {User} from "../user/entities/user.entity";
import {CommonModule} from "../common/common.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Survey, SurveyQuestion, SurveyResponse, SurveyOption, SurveyAnswer, User
        ]), CommonModule
    ],
    controllers: [SurveyController],
    providers: [SurveyService],
})
export class SurveyModule {
}
