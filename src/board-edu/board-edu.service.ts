import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {CreateBoardDto, CreateBoardReplyDto, CreateCommentDto} from "../board/dto/create-board.dto";
import {QueryRunner, Repository} from "typeorm";
import {GetPostsDto} from "../board/dto/get-posts.dto";
import {envVariables} from "../common/const/env.const";
import {UpdateBoardDto} from "../board/dto/update-board.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {BoardFile} from "../file/entities/board_file.entity";
import {User} from "../user/entities/user.entity";
import {G5Board} from "../board/entities/g5-board.entity";
import {CommonService} from "../common/common.service";
import {ConfigService} from "@nestjs/config";
import {BoardEdu} from "./entities/board-edu.entity";

@Injectable()
export class BoardEduService {
    constructor(
        @InjectRepository(BoardEdu) private readonly noticeRepository: Repository<BoardEdu>,
        @InjectRepository(BoardFile) private readonly fileRepository: Repository<BoardFile>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(G5Board) private readonly boardRepository: Repository<G5Board>,
        private readonly commonService: CommonService,
        private readonly configService: ConfigService,
    ) {
    }

    // 그누보드 관례: wr_num은 MIN-1
    private async getNextNum(): Promise<number> {
        const row = await this.noticeRepository
            .createQueryBuilder('w')
            .select('MIN(w.wrNum)', 'min')
            .getRawOne<{ min: number | null }>();
        return row?.min != null ? row.min - 1 : -1;
    }

    // wr_reply 다음 문자 계산 (bo_reply_order에 따라 A→Z 또는 Z→A)
    private async getNextReplyChar(wrNum: number, parentReply: string,): Promise<string> {
        const len = parentReply.length + 1;
        const qb = this.noticeRepository
            .createQueryBuilder('w')
            .select(`MAX(SUBSTRING(w.wrReply, ${len}, 1))`, 'reply')
            .where('w.wrNum = :wrNum', {wrNum})
            .andWhere(`SUBSTRING(w.wrReply, :len, 1) <> ''`, {len});

        if (parentReply) qb.andWhere('w.wrReply LIKE :prefix', {prefix: `${parentReply}%`});

        const row = await qb.getRawOne<{ reply: string | null }>();

        const begin = 'A';
        const end = 'Z';
        if (!row?.reply) return begin;
        if (row.reply === end) throw new BadRequestException('더 이상 답변할 수 없습니다.');

        const code = row.reply.charCodeAt(0) + 1;
        return String.fromCharCode(code);
    }

    async findMember(mbNo: number) {
        const mb = await this.userRepository.findOne({where: {mbNo}});
        if (!mb) throw new NotFoundException('멤버 정보를 찾을 수 없습니다.');
        return mb;
    }

    // 새 글
    async createPost(
        dto: CreateBoardDto,
        ip: string,
        mbNo: number,
        qr: QueryRunner,
    ) {
        const mb = await this.findMember(mbNo);

        const manager = qr.manager;

        const wrNum = await this.getNextNum();

        const now = new Date();
        const entity = manager.create(BoardEdu, {
            wrNum: wrNum ?? '',
            wrReply: '',
            wrParent: 0,
            wrCommentReply: '',
            caName: dto.caName ?? '',
            wrOption: dto.wrOption ?? '',
            wrSubject: dto.wrSubject,
            wrContent: dto.wrContent,
            wrLink1: dto.wrLink1,
            wrLink2: dto.wrLink2,
            mbId: mb.mbId ?? '',
            wrPassword: mb.mbPassword ?? '',
            wrName: mb.mbNick ?? '',
            wrEmail: mb.mbEmail ?? '',
            wrHomepage: mb.mbHomepage ?? '',
            wrDatetime: this.formatDateTime(now),
            wrFile: 0,
            wrLast: this.formatDateTime(now),
            wrIp: ip,
            wr1: dto.wr1 ?? '',
        });

        const saved = await manager.save(BoardEdu, entity);
        await manager.update(BoardEdu, {wrId: saved.wrId}, {wrParent: saved.wrId});

        return saved.wrId;

    }

    async findPost(wrId: number) {
        const parent = await this.noticeRepository.findOne({where: {wrId: wrId}});
        if (!parent) throw new BadRequestException('원글이 없습니다.');
        if (parent.wrReply.length >= 10) throw new BadRequestException('더 이상 답변할 수 없습니다.');
        return parent;
    }

    // 답변
    async replyPost(
        parentId: number,
        dto: CreateBoardReplyDto,
        ip: string,
        mbNo: number,
        qr: QueryRunner,
    ) {
        const parent = await this.findPost(parentId);
        const writer = await this.findMember(mbNo);

        const nextChar = await this.getNextReplyChar(parent.wrNum, parent.wrReply);
        const reply = parent.wrReply + nextChar;

        const now = new Date();
        const entity = qr.manager.create(BoardEdu, {
            wrNum: parent.wrNum,
            wrReply: reply,
            wrParent: 0, // 아래에서 self로 정규화
            wrCommentReply: '',
            caName: parent.caName ?? '',
            wrOption: parent.wrOption ?? '',
            wrSubject: dto.wrSubject,
            wrContent: dto.wrContent,
            wrSeoTitle: '',
            wrLink1: '',
            wrLink2: '',
            mbId: writer.mbId ?? '',
            wrPassword: (dto.wrOption ?? '').includes('secret') ? parent.wrPassword : (writer.mbPassword ?? ''),
            wrName: writer.mbNick ?? '',
            wrEmail: writer.mbEmail ?? '',
            wrHomepage: writer.mbHomepage ?? '',
            wrDatetime: this.formatDateTime(now),
            wrLast: this.formatDateTime(now),
            wrIp: ip,
            wr1: parent.wr1,
        });

        const saved = await qr.manager.save(BoardEdu, entity);

        await qr.manager.update(BoardEdu, {wrId: saved.wrId}, {wrParent: saved.wrId});
        return saved.wrId;
    }

    private async getNextCommentLetter(
        qr: QueryRunner,
        parentId: number,
        baseComment: BoardEdu, // 대상 댓글
    ): Promise<string> {
        const pos = (baseComment.wrCommentReply?.length ?? 0) + 1;
        const begin = 'A';
        const end = 'Z';
        const step = 1;

        const qb = qr.manager
            .createQueryBuilder(BoardEdu, 'w')
            .select(
                'MAX(SUBSTRING(w.wr_comment_reply, :pos, 1)) AS reply'
            )
            .where('w.wr_parent = :pid', {pid: parentId})
            .andWhere('w.wr_is_comment = 1')
            .andWhere('w.wr_comment = :grp', {grp: baseComment.wrComment})
            .andWhere('SUBSTRING(w.wr_comment_reply, :pos, 1) <> ""', {pos});

        if (baseComment.wrCommentReply) {
            qb.andWhere('w.wr_comment_reply LIKE :prefix', {prefix: `${baseComment.wrCommentReply}%`});
        }

        // reply는 문자열 또는 undefined
        const row = await qb.getRawOne<{ reply: string | null }>();
        const cur = row?.reply;

        if (!cur) return begin;
        if (cur === end) throw new BadRequestException('대댓글 분기 한도 도달');

        return String.fromCharCode(cur.charCodeAt(0) + step);
    }

    async createComment(
        parentId: number,
        dto: CreateCommentDto,
        ip: string,
        mbNo: number,
        qr: QueryRunner,
        commentId?: number,
    ) {
        const parent = await this.findPost(parentId);
        const writer = await this.findMember(mbNo);

        let wrComment: number = 0;
        let wrCommentReply = '';

        if (commentId) {
            // 대댓글: 대상 댓글 조회
            const base = await qr.manager.findOne(BoardEdu, {
                where: {wrId: commentId, wrParent: parentId, wrIsComment: 1},
            });
            if (!base) throw new BadRequestException('대상 댓글이 없습니다.');

            const nextPos = (base.wrCommentReply?.length ?? 0) + 1;
            if (nextPos > 5) throw new BadRequestException('대댓글 최대 5단계 제한');

            const nextChar = await this.getNextCommentLetter(qr, parent.wrId, base); // asc 기준
            wrComment = base.wrComment;
            wrCommentReply = (base.wrCommentReply ?? '') + nextChar;
        }

        const now = new Date();
        const entity = qr.manager.create(BoardEdu, {
            wrNum: parent.wrNum,
            wrReply: '',
            wrParent: parent.wrId,
            wrIsComment: 1,
            wrComment: wrComment,
            wrCommentReply: wrCommentReply,
            caName: parent.caName ?? '',
            wrOption: parent.wrOption ?? '',
            wrSubject: '',
            wrContent: dto.wrContent,
            wrSeoTitle: '',
            wrLink1: '',
            wrLink2: '',
            mbId: writer.mbId ?? '',
            wrPassword: parent.wrPassword,
            wrName: writer.mbNick ?? '',
            wrEmail: writer.mbEmail ?? '',
            wrHomepage: writer.mbHomepage ?? '',
            wrDatetime: this.formatDateTime(now),
            wrLast: this.formatDateTime(now),
            wrIp: ip,
            wr1: parent.wr1
        });

        const saved = await qr.manager.save(BoardEdu, entity);

        await qr.manager.update(BoardEdu, {wrId: parent.wrId}, {
            wrComment: parent.wrComment + 1,
            wrIsComment: 0,
            wrLast: this.formatDateTime(now)
        });
        return saved.wrId;
    }

    getPosts() {
        return this.noticeRepository
            .createQueryBuilder('post')
    }


    // 목록 조회
    async findAll(dto: GetPostsDto) {

        const {title, caName, wr1} = dto;
        const qb = this.getPosts().where('1=1'); // 안전한 시작점

        if (title) qb.where('post.wrSubject LIKE :sub', {sub: `%${title}%`});
        if (caName) qb.andWhere('post.caName LIKE :ca', {ca: `%${caName}%`});
        if (wr1) qb.andWhere('post.wr1 LIKE :wr', {wr: `%${wr1}%`});

        this.commonService.applyPagePaginationParamToQb(qb, dto);

        const [rows, count] = await qb.getManyAndCount();

        // 이미 필요한 컬럼만 select 했으므로 추가 map 없이 바로 반환 가능
        // 만약 응답 키 이름을 통일하고 싶다면 아래처럼 가볍게 매핑
        const data = rows.map(e => ({
            wrId: e.wrId,
            wrSubject: e.wrSubject,
            wrName: e.wrName,
            wrDatetime: e.wrDatetime,
            caName: e.caName,
            wr1: e.wr1,
            wr2: e.wr2,
            wr3: e.wr3,
            wr4: e.wr4,
            wr5: e.wr5,
        }));

        return {
            data,
            meta: {
                count,
                page: dto.page ?? 1,
                take: dto.take ?? 10,
            }
        };
    }

    async findOne(wrId: number) {
        const [post, files, ip] = await Promise.all([
            this.findPost(wrId),
            this.fileRepository.find({
                where: {
                    boTable: 'comm22',
                    wrId: wrId,
                }
            }),
            this.configService.get<string>(envVariables.serverHost)
        ]);

        const lite = files.map((e) => ({
            url: `http://${ip}/data/file/comm22/${e.bfFile}`,
            fileName: e.bfSource,
        }))

        await this.noticeRepository.update({wrId}, {
            wrHit: post.wrHit + 1
        })

        const comments = await this.noticeRepository.find({
            where: {wrParent: wrId, wrIsComment: 1},
            order: {wrComment: "DESC"}
        })


        return {
            ...post,
            comments,
            files: lite,
        };
    }

    // 수정
    async updatePost(wrId: number, ip: string, dto: UpdateBoardDto, mbNo: number): Promise<void> {
        const post = await this.findPost(wrId);
        const mb = await this.findMember(mbNo);

        const boardData = await this.boardRepository.findOne({
            where: {
                boTable: 'comm22'
            }
        });

        if (mb.mbLevel !== 10 && boardData?.boAdmin !== mb.mbId && mb.mbId === post.mbId) {
            throw new ForbiddenException('삭제 권한이 없습니다.');
        }
        const now = this.formatDateTime(new Date());
        await this.noticeRepository.update(
            {wrId},
            {
                wrSubject: dto.wrSubject ?? post.wrSubject,
                wrContent: dto.wrContent ?? post.wrContent,
                caName: dto.caName ?? post.caName,
                wrOption: dto.wrOption ?? post.wrOption,
                wrLast: now,
                wrIp: ip ?? post.wrIp,
                wr1: dto.wr1 ?? post.wr1,
                wr2: dto.wr2 ?? post.wr2,
                wr3: dto.wr3 ?? post.wr3,
                wr4: dto.wr4 ?? post.wr4,
                wr5: dto.wr5 ?? post.wr5,
            },
        );
        return
    }

    // 파일 메타 업서트 및 wr_file 갱신
    async upsertFiles(
        boTable: string,
        wrId: number,
        items: Array<{
            bfNo: number;
            source?: string;
            saved?: string;
            bytes?: number;
            width?: number;
            height?: number;
            type?: number;
            content?: string;
            fileurl?: string;
            thumburl?: string;
            storage?: string;
            del?: boolean;
        }>,
    ): Promise<void> {
        const now = new Date();

        for (const f of items) {
            const pk = {boTable, wrId, bfNo: f.bfNo};
            const exists = await this.fileRepository.findOne({where: pk});

            if (exists) {
                if (f.del) {
                    await this.fileRepository.update(pk, {
                        bfSource: '',
                        bfFile: '',
                        bfContent: '',
                        bfFilesize: 0,
                        bfWidth: 0,
                        bfHeight: 0,
                        bfType: 0,
                        bfFileurl: '',
                        bfThumburl: '',
                        bfStorage: '',
                        bfDatetime: now,
                    });
                } else {
                    await this.fileRepository.update(pk, {
                        bfSource: f.source ?? exists.bfSource,
                        bfFile: f.saved ?? exists.bfFile,
                        bfContent: f.content ?? exists.bfContent,
                        bfFilesize: f.bytes ?? exists.bfFilesize,
                        bfWidth: f.width ?? exists.bfWidth,
                        bfHeight: f.height ?? exists.bfHeight,
                        bfType: f.type ?? exists.bfType,
                        bfFileurl: f.fileurl ?? exists.bfFileurl,
                        bfThumburl: f.thumburl ?? exists.bfThumburl,
                        bfStorage: f.storage ?? exists.bfStorage,
                        bfDatetime: now,
                    });
                }
            } else {
                await this.fileRepository.insert({
                    boTable,
                    wrId,
                    bfNo: f.bfNo,
                    bfSource: f.source ?? '',
                    bfFile: f.saved ?? '',
                    bfContent: f.content ?? '',
                    bfDownload: 0,
                    bfFilesize: f.bytes ?? 0,
                    bfWidth: f.width ?? 0,
                    bfHeight: f.height ?? 0,
                    bfType: f.type ?? 0,
                    bfFileurl: f.fileurl ?? '',
                    bfThumburl: f.thumburl ?? '',
                    bfStorage: f.storage ?? '',
                    bfDatetime: now,
                });
            }
        }

        // wr_file = 첨부 개수(bf_file != '')
        const cnt = await this.fileRepository
            .createQueryBuilder('f')
            .where('f.boTable = :boTable AND f.wrId = :wrId AND f.bfFile <> :empty', {
                boTable, wrId, empty: '',
            })
            .getCount();

        await this.noticeRepository.update({wrId}, {wrFile: cnt});
    }

    private formatDateTime(d: Date): string {
        // 'YYYY-MM-DD HH:mm:SS' 포맷 (엔티티가 문자열 컬럼이므로)
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    async deletePost(wrId: number, mbNo: number): Promise<void> {

        const mb = await this.findMember(mbNo);

        const post = await this.findPost(wrId);

        const boardData = await this.boardRepository.findOne({
            where: {
                boTable: 'comm22'
            }
        });

        if (mb.mbLevel !== 10 && boardData?.boAdmin !== mb.mbId && mb.mbId === post.mbId) {
            throw new ForbiddenException('삭제 권한이 없습니다.');
        }
        const isReply = await this.noticeRepository.find({
            where: {
                wrParent: post.wrId
            }
        })

        if (isReply) {
            throw new ForbiddenException('덧글과 댓글을 삭제후 삭제가 가능합니다.');
        }

        await this.noticeRepository.delete({wrId});
    }


}
