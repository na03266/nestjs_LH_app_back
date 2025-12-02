import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {In, QueryRunner, Repository} from "typeorm";
import {Survey} from "./entities/survey.entity";
import {SurveyOption} from "./entities/survey-option.entity";
import {SurveyQuestion} from "./entities/survey-question.entity";
import {SurveyResponse} from "./entities/survey-response.entity";
import {SurveyAnswer} from "./entities/survey-answer.entity";
import {User} from "../user/entities/user.entity";
import {JoinSurveyDTO} from "./dto/join-survay.dto";
import {GetPostsDto} from "../board/dto/get-posts.dto";
import {CommonService} from "../common/common.service";

@Injectable()
export class SurveyService {
    constructor(
        @InjectRepository(Survey)
        private readonly surveyRepository: Repository<Survey>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(SurveyQuestion)
        private readonly questionRepository: Repository<SurveyQuestion>,
        @InjectRepository(SurveyOption)
        private readonly optionRepository: Repository<SurveyOption>,
        @InjectRepository(SurveyResponse)
        private readonly responseRepository: Repository<SurveyResponse>,
        @InjectRepository(SurveyAnswer)
        private readonly answerRepository: Repository<SurveyAnswer>,

        private readonly commonService: CommonService,
    ) {
    }

    async findMe(mbNo: number) {
        const me = await this.userRepository.findOne({where: {mbNo}})

        if (!me) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.')
        }
        return me;
    }

    /**
     * 설문 목록 조회
     * - 기본 정보만 조회
     * - 필요시 relations 옵션으로 질문/선택지까지 포함 가능
     */
    async findAll(mbNo: number, dto: GetPostsDto) {
        const me = await this.findMe(mbNo);

        const {title} = dto;
        const qb = this.surveyRepository.createQueryBuilder('po');

        if (title) qb.andWhere('po.poSubject LIKE :sub', {sub: `%${title}%`});
        qb.andWhere('po.poIsSurvey = 1')

        this.commonService.applyPagePaginationParamToQbForSurvey(qb, dto);

        const [rows, count] = await qb.getManyAndCount();

        const data = await Promise.all(
            rows.map(async (e) => {
                const exists = await this.responseRepository.exists({
                    where: {
                        mbId: me.mbId,
                        poId: e.poId,
                    },
                });

                return {
                    isSurvey: exists,             // true/false
                    poDate: e.poDate,
                    poDateEnd: e.poDateEnd,
                    poSubject: e.poSubject,
                    poCnt1: e.poCnt1,
                    poId: e.poId,
                };
            }),
        );

        return{
            data,
            meta:{
                count,
                page: dto.page ?? 1,
                take: dto.take ?? 10,            }
        }

    }

    /**
     * 설문 단건 조회
     * - 질문/선택지까지 함께 로딩
     */
    async findOne(id: number): Promise<Survey> {

        const survey = await this.surveyRepository.findOne({
            where: {poId: id},
            relations: ['questions', 'questions.options'],
        });

        if (!survey) {
            throw new NotFoundException(`Survey ${id} not found`);
        }

        return survey;
    }

    /**
     * 설문 단건 조회 이미 참석한 사람 ver
     * - 질문/선택지까지 함께 로딩
     */
    async findOneForAttendant(id: number, mbNo: number): Promise<Survey> {
        const me = this.findMe(mbNo);

        const survey = await this.surveyRepository.findOne({
            where: {poId: id},
            relations: ['questions', 'questions.options'],
        });

        if (!survey) {
            throw new NotFoundException(`Survey ${id} not found`);
        }

        return survey;
    }


    async joinSurvey(
        poId: number,
        mbNo: number,
        ip: string,
        dto: JoinSurveyDTO,
        qr: QueryRunner,
    ) {
        // 1. 회원/설문 기본정보 확인
        const me = await this.findMe(mbNo);
        const survey = await this.findOne(poId);

        if (!survey) {
            throw new NotFoundException(`설문(poId=${poId})이 존재하지 않습니다.`);
        }

        // 2. 이미 응답했는지 체크(회원 1회 제한)
        const exists = await qr.manager.getRepository(SurveyResponse).findOne({
            where: {
                poId,
                mbId: me.mbId,
            },
        });

        if (exists) {
            throw new BadRequestException('이미 참여한 설문입니다.');
        }

        // 3. 응답 헤더 생성 (g5_survey_responses)
        const response = qr.manager.getRepository(SurveyResponse).create({
            poId,
            mbId: me.mbId,
            srIp: ip,
            srDatetime: new Date(),
        });

        const savedResponse = await qr.manager
            .getRepository(SurveyResponse)
            .save(response);

        // 4. 질문 정보 로딩 (검증용)
        const sqIds = dto.answers.map((e) => e.sqId);
        const questions = await qr.manager.getRepository(SurveyQuestion).findBy({
            sqId: In(sqIds),
        });

        const qMap = new Map<number, SurveyQuestion>();
        questions.forEach((q) => qMap.set(q.sqId, q));

        // 5. 저장할 SurveyAnswer 엔티티 생성
        const answerRepo = qr.manager.getRepository(SurveyAnswer);
        const answerEntities: SurveyAnswer[] = [];

        for (const a of dto.answers) {
            const q = qMap.get(a.sqId);
            if (!q) {
                throw new BadRequestException(`질문이 존재하지 않습니다. sqId=${a.sqId}`);
            }

            switch (q.sqType) {
                case 'radio':
                    if (!a.soId) throw new BadRequestException(`radio 질문은 soId가 필요합니다.`);
                    answerEntities.push(
                        answerRepo.create({
                            srId: savedResponse.srId,
                            sqId: a.sqId,
                            soId: a.soId,
                            saText: null,
                            saRating: null,
                        }),
                    );
                    break;

                case 'checkbox':
                    if (!a.soId) throw new BadRequestException(`checkbox 질문은 soId가 필요합니다.`);
                    answerEntities.push(
                        answerRepo.create({
                            srId: savedResponse.srId,
                            sqId: a.sqId,
                            soId: a.soId,
                            saText: null,
                            saRating: null,
                        }),
                    );
                    break;

                case 'text':
                    answerEntities.push(
                        answerRepo.create({
                            srId: savedResponse.srId,
                            sqId: a.sqId,
                            soId: null,
                            saText: a.text ?? '',
                            saRating: null,
                        }),
                    );
                    break;

                case 'radio_text': // 선택지 + 텍스트
                    if (!a.soId) throw new BadRequestException(`radio_text 질문은 soId가 필요합니다.`);
                    answerEntities.push(
                        answerRepo.create({
                            srId: savedResponse.srId,
                            sqId: a.sqId,
                            soId: a.soId,
                            saText: a.text ?? null,
                            saRating: null,
                        }),
                    );
                    break;

                case 'rating':
                    if (!a.saRating || a.saRating < 1 || a.saRating > 5)
                        throw new BadRequestException(`rating 질문은 1~5 사이의 rating 값이 필요합니다.`);
                    answerEntities.push(
                        answerRepo.create({
                            srId: savedResponse.srId,
                            sqId: a.sqId,
                            soId: null,
                            saText: null,
                            saRating: a.saRating,
                        }),
                    );
                    break;

                default:
                    throw new BadRequestException(`지원하지 않는 질문 유형입니다. type=${q.sqType}`);
            }
        }

        // 6. 상세답변 bulk insert
        if (answerEntities.length > 0) {
            await answerRepo.save(answerEntities);
        }

        return {
            message: '설문 참여 완료',
            srId: savedResponse.srId,
        };
    }

}
