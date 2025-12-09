import {BadRequestException, ForbiddenException, NotFoundException,} from '@nestjs/common';
import {Not, QueryRunner, Repository} from 'typeorm';
import {BoardFile} from '../file/entities/board_file.entity';
import {User} from '../user/entities/user.entity';
import {FileService} from '../common/file/file.service';
import {BaseBoard} from './entities/base-board.entity';
import {G5Board} from '../board/entities/g5-board.entity';
import {GetPostsDto} from './dto/get-posts.dto';
import {CreateCommentDto, CreateWriteDto, CreateWriteReplyDto,} from './dto/create-write.dto';
import {UpdateWriteDto} from './dto/update-write.dto';
import {CommonService} from '../common/common.service';
import {envVariables} from "../common/const/env.const";
import {ConfigService} from "@nestjs/config";

type CommentMinimal = {
    wrComment: number;
    wrCommentReply?: string | null;
};

export abstract class AbstractWriteService<T extends BaseBoard> {
    /** 각 게시판 서비스에서 boTable만 지정 */
    protected abstract readonly boTable: string;

    constructor(
        protected readonly boardRepo: Repository<T>,
        protected readonly fileRepo: Repository<BoardFile>,
        protected readonly userRepo: Repository<User>,
        protected readonly g5BoardRepo: Repository<G5Board>,
        protected readonly fileService: FileService,
        protected readonly commonService: CommonService,
        private readonly configService: ConfigService,

    ) {
    }

    /* -----------------------
       1. Private Utils
    ------------------------ */

    protected formatDateTime(d: Date): string {
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
            d.getDate(),
        )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    protected async getNextNum(): Promise<number> {
        const row = await this.boardRepo
            .createQueryBuilder('w')
            .select('MIN(w.wrNum)', 'min')
            .getRawOne<{ min: number | null }>();
        return row?.min != null ? row.min - 1 : -1;
    }

    protected async getNextReplyChar(
        wrNum: number,
        parentReply: string,
    ): Promise<string> {
        const len = parentReply.length + 1;
        const qb = this.boardRepo
            .createQueryBuilder('w')
            .select(`MAX(SUBSTRING(w.wrReply, ${len}, 1))`, 'reply')
            .where('w.wrNum = :wrNum', {wrNum})
            .andWhere(`SUBSTRING(w.wrReply, :len, 1) <> ''`, {len});

        if (parentReply) {
            qb.andWhere('w.wrReply LIKE :prefix', {prefix: `${parentReply}%`});
        }

        const row = await qb.getRawOne<{ reply: string | null }>();

        const begin = 'A';
        const end = 'Z';
        if (!row?.reply) return begin;
        if (row.reply === end) throw new BadRequestException('더 이상 답변할 수 없습니다.');

        const code = row.reply.charCodeAt(0) + 1;
        return String.fromCharCode(code);
    }

    protected async getNextCommentLetter(
        qr: QueryRunner,
        parentId: number,
        baseComment: CommentMinimal,
    ): Promise<string> {
        const pos = (baseComment.wrCommentReply?.length ?? 0) + 1;
        const begin = 'A';
        const end = 'Z';
        const step = 1;

        const qb = qr.manager
            .createQueryBuilder(this.boardRepo.target as any, 'w')
            .select('MAX(SUBSTRING(w.wr_comment_reply, :pos, 1)) AS reply')
            .where('w.wr_parent = :pid', {pid: parentId})
            .andWhere('w.wr_is_comment = 1')
            .andWhere('w.wr_comment = :grp', {grp: baseComment.wrComment})
            .andWhere('SUBSTRING(w.wr_comment_reply, :pos, 1) <> ""', {pos});

        if (baseComment.wrCommentReply) {
            qb.andWhere('w.wr_comment_reply LIKE :prefix', {
                prefix: `${baseComment.wrCommentReply}%`,
            });
        }

        const row = await qb.getRawOne<{ reply: string | null }>();
        const cur = row?.reply;

        if (!cur) return begin;
        if (cur === end) throw new BadRequestException('대댓글 분기 한도 도달');

        return String.fromCharCode(cur.charCodeAt(0) + step);
    }

    /* -----------------------
        2. Read
    ------------------------ */

    async findMember(mbNo: number) {
        const mb = await this.userRepo.findOne({where: {mbNo}});
        if (!mb) throw new NotFoundException('멤버 정보를 찾을 수 없습니다.');
        return mb;
    }

    async findPost(wrId: number) {
        const post = await this.boardRepo.findOne({where: {wrId} as any});
        if (!post) throw new NotFoundException('게시글이 없습니다.');
        return post;
    }

    async findAll(dto: GetPostsDto) {
        const {title, caName, wr1} = dto;
        const qb = this.boardRepo.createQueryBuilder('post').where('1=1');

        if (title) qb.andWhere('post.wrSubject LIKE :sub', {sub: `%${title}%`});
        if (caName) qb.andWhere('post.caName LIKE :ca', {ca: `%${caName}%`});
        if (wr1) qb.andWhere('post.wr1 LIKE :wr', {wr: `%${wr1}%`});

        this.commonService.applyPagePaginationParamToQb(qb, dto);

        const [rows, count] = await qb.getManyAndCount();

        return {
            data: rows,
            meta: {
                count,
                page: dto.page ?? 1,
                take: dto.take ?? 10,
            },
        };
    }

    /** host는 컨트롤러/상속 서비스에서 ConfigService로 주입해서 넘기는 구조 */
    async findOne(wrId: number) {
        const post = await this.findPost(wrId);

        const [files, comments] = await Promise.all([
            this.fileRepo.find({
                where: {boTable: this.boTable, wrId} as any,
                order: {bfNo: 'ASC'},
            }),
            this.boardRepo.find({
                where: {wrParent: wrId, wrIsComment: 1} as any,
                order: {wrComment: 'DESC' as any},
            }),
        ]);

        await this.boardRepo.update(wrId, {wrHit: post.wrHit + 1} as any);
        const host = this.configService.get<string>(envVariables.serverHost)

        const lite = files.map((f) => ({
            bfNo: f.bfNo,
            fileName: f.bfSource,
            savedName: f.bfFile,
            url: `http://${host}/data/file/${this.boTable}/${f.bfFile}`,
        }));

        return {
            ...post,
            comments,
            files: lite,
        };
    }

    /* -----------------------
       3. Create
    ------------------------ */

    async createPost(
        dto: CreateWriteDto,
        ip: string,
        mbNo: number,
        qr: QueryRunner,
    ) {
        const mb = await this.findMember(mbNo);
        const repo = qr.manager.getRepository<T>(this.boardRepo.target as any);

        const wrNum = await this.getNextNum();
        const now = new Date();

        const entity = repo.create({
            wrNum,
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
            wr2: dto.wr2 ?? '',
            wr3: dto.wr3 ?? '',
            wr4: dto.wr4 ?? '',
            wr5: dto.wr5 ?? '',
        } as any);

        const saved = await repo.save(entity as any);

        await repo.update(saved.wrId, {wrParent: saved.wrId} as any);

        if (dto.files?.length) {
            const count = await this.fileService.saveBoardFiles({
                boTable: this.boTable,
                wrId: saved.wrId,
                files: dto.files,
                manager: qr.manager,
            });

            await repo.update(saved.wrId, {wrFile: count} as any);
        }

        return saved.wrId;
    }

    /* -----------------------
       4. Reply / Comment
    ------------------------ */

    async replyPost(
        parentId: number,
        dto: CreateWriteReplyDto,
        ip: string,
        mbNo: number,
        qr: QueryRunner,
    ) {
        const parent = await this.findPost(parentId);
        const writer = await this.findMember(mbNo);

        const repo = qr.manager.getRepository<T>(this.boardRepo.target as any);

        const nextChar = await this.getNextReplyChar(parent.wrNum, parent.wrReply);
        const reply = parent.wrReply + nextChar;
        const now = new Date();

        const entity = repo.create({
            wrNum: parent.wrNum,
            wrReply: reply,
            wrParent: 0,
            wrCommentReply: '',
            caName: parent.caName ?? '',
            wrOption: parent.wrOption ?? '',
            wrSubject: dto.wrSubject,
            wrContent: dto.wrContent,
            wrSeoTitle: '',
            wrLink1: '',
            wrLink2: '',
            mbId: writer.mbId ?? '',
            wrPassword: (dto.wrOption ?? '').includes('secret')
                ? parent.wrPassword
                : writer.mbPassword ?? '',
            wrName: writer.mbNick ?? '',
            wrEmail: writer.mbEmail ?? '',
            wrHomepage: writer.mbHomepage ?? '',
            wrDatetime: this.formatDateTime(now),
            wrLast: this.formatDateTime(now),
            wrIp: ip,
            wr1: parent.wr1,
        } as any);

        const saved = await repo.save(entity as any);

        await repo.update(saved.wrId, {wrParent: saved.wrId} as any);

        return saved;
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

        let wrComment = 0;
        let wrCommentReply = '';

        if (commentId) {
            const base = await qr.manager.findOne(this.boardRepo.target as any, {
                where: {
                    wrId: commentId,
                    wrParent: parentId,
                    wrIsComment: 1,
                } as any,
            });

            if (!base) throw new BadRequestException('대상 댓글이 없습니다.');

            const nextPos = (base.wrCommentReply?.length ?? 0) + 1;
            if (nextPos > 5) {
                throw new BadRequestException('대댓글 최대 5단계 제한');
            }

            const nextChar = await this.getNextCommentLetter(
                qr,
                parent.wrId,
                base as any,
            );
            wrComment = (base as any).wrComment;
            wrCommentReply = ((base as any).wrCommentReply ?? '') + nextChar;
        }

        const now = new Date();

        const entity = qr.manager.create(this.boardRepo.target as any, {
            wrNum: parent.wrNum,
            wrReply: '',
            wrParent: parent.wrId,
            wrIsComment: 1,
            wrComment,
            wrCommentReply,
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
            wr1: parent.wr1,
        } as any);

        const saved = await qr.manager.save(this.boardRepo.target as any, entity as any);

        await qr.manager.update(
            this.boardRepo.target as any,
            parent.wrId,
            {
                wrComment: parent.wrComment + 1,
                wrIsComment: 0,
                wrLast: this.formatDateTime(now),
            } as any,
        );

        return saved;
    }

    /* -----------------------
       5. Update
    ------------------------ */

    async updatePost(
        wrId: number,
        dto: UpdateWriteDto,
        ip: string,
        mbNo: number,
    ) {
        const post = await this.findPost(wrId);
        const mb = await this.findMember(mbNo);

        const boardMeta = await this.g5BoardRepo.findOne({
            where: {boTable: this.boTable},
        });

        if (
            mb.mbLevel <= 4 &&
            boardMeta?.boAdmin !== mb.mbId &&
            mb.mbId !== post.mbId
        ) {
            throw new ForbiddenException('수정 권한이 없습니다.');
        }

        const now = this.formatDateTime(new Date());

        await this.boardRepo.update(wrId, {
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
        } as any);

        await this.fileService.updateBoardFiles({
            boTable: this.boTable,
            wrId,
            keepFiles: dto.keepFiles ?? [],
            newFiles: dto.newFiles ?? [],
            manager: this.boardRepo.manager,
        });

        const totalFiles = await this.fileRepo.count({
            where: {boTable: this.boTable, wrId, bfFile: Not('')} as any,
        });

        await this.boardRepo.update(wrId, {wrFile: totalFiles} as any);
    }

    /* -----------------------
       6. Delete
    ------------------------ */

    async deletePost(wrId: number, mbNo: number) {
        const mb = await this.findMember(mbNo);
        const post = await this.findPost(wrId);

        const boardMeta = await this.g5BoardRepo.findOne({
            where: {boTable: this.boTable},
        });

        if (
            mb.mbLevel !== 10 &&
            boardMeta?.boAdmin !== mb.mbId &&
            mb.mbId !== post.mbId
        ) {
            throw new ForbiddenException('삭제 권한이 없습니다.');
        }


        // 원글에 달린 댓글/답글 존재 여부 체크
        if(post.wrId != post.wrParent) {
            const hasReplies = await this.boardRepo.exists({
                where: {wrParent: post.wrId} as any,
            });
            if (hasReplies) {
                throw new ForbiddenException(
                    '댓글/대댓글 삭제 후 게시글 삭제가 가능합니다.',
                );
            }
        }

        await this.fileService.deleteBoardFiles({
            boTable: this.boTable,
            wrId,
            manager: this.boardRepo.manager,
        });

        await this.boardRepo.delete(wrId);
    }
}
