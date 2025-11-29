import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    ClassSerializerInterceptor, Ip, Query
} from '@nestjs/common';
import {SurveyService} from './survey.service';
import {CreateSurveyDto} from './dto/create-survey.dto';
import {UpdateSurveyDto} from './dto/update-survey.dto';
import {UserId} from "../user/decorator/user-id.decorator";
import {JoinSurveyDTO} from "./dto/join-survay.dto";
import {TransactionInterceptor} from "../common/interceptor/transaction.interceptor";
import {QueryRunner} from "../common/decorator/query-runner.decorator";
import {QueryRunner as QR} from "typeorm/query-runner/QueryRunner";
import {GetPostsDto} from "../board/dto/get-posts.dto";

@UseInterceptors(ClassSerializerInterceptor)
@Controller('survey')
export class SurveyController {
    constructor(private readonly surveyService: SurveyService) {
    }


    @Get()
    async findAll(
        @UserId() mbNo: number,
        @Query() dto: GetPostsDto,
    ) {
        return await this.surveyService.findAll(mbNo, dto);
    }

    @Get(':id')
    findOne(
        @Param('id') id: string,
        @UserId() mbNo: number,
    ) {
        return this.surveyService.findOne(+id);
    }

    @Post(':id')
    @UseInterceptors(TransactionInterceptor)
    joinSurvey(
        @Param('id') poId: String,
        @Body() dto: JoinSurveyDTO,
        @UserId() mbNo: number,
        @Ip() ip: string,
        @QueryRunner() queryRunner: QR,
    ) {
        return this.surveyService.joinSurvey(+poId, mbNo, ip, dto, queryRunner);
    }

}
