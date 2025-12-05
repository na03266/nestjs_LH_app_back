// src/base-write/abstract-write.controller.ts
import {
    Body,
    Delete,
    Get,
    Ip,
    Param,
    Patch,
    Post,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import {QueryRunner as QR} from 'typeorm';
import {TransactionInterceptor} from '../common/interceptor/transaction.interceptor';
import {QueryRunner} from '../common/decorator/query-runner.decorator';
import {UserId} from '../user/decorator/user-id.decorator';

import {AbstractWriteService} from './abstract-write.service';
import {
    CreateWriteDto,
    CreateWriteReplyDto,
    CreateCommentDto,
} from './dto/create-write.dto';
import {UpdateWriteDto} from './dto/update-write.dto';
import {GetPostsDto} from './dto/get-posts.dto';

export abstract class AbstractWriteController<
    TService extends AbstractWriteService<any>,
> {
    protected constructor(protected readonly service: TService) {
    }

    // 1) 새 글
    @Post()
    @UseInterceptors(TransactionInterceptor)
    async createPost(
        @Body() dto: CreateWriteDto,
        @QueryRunner() queryRunner: QR,
        @Ip() ip: string,
        @UserId() mbNo: number,
    ) {
        return this.service.createPost(dto, ip, mbNo, queryRunner);
    }

    // 2) 답글
    @Post('/reply')
    @UseInterceptors(TransactionInterceptor)
    async replyPost(
        @Query('parentId') parentId: number,
        @Body() dto: CreateWriteReplyDto,
        @QueryRunner() queryRunner: QR,
        @Ip() ip: string,
        @UserId() mbNo: number,
    ) {
        return this.service.replyPost(parentId, dto, ip, mbNo, queryRunner);
    }

    // 3) 댓글
    @Post('/comment')
    @UseInterceptors(TransactionInterceptor)
    async createComment(
        @Query('parentId') parentId: number,
        @Body() dto: CreateCommentDto,
        @QueryRunner() queryRunner: QR,
        @Ip() ip: string,
        @UserId() mbNo: number,
    ) {
        return this.service.createComment(parentId, dto, ip, mbNo, queryRunner);
    }

    // 4) 대댓글
    @Post('/comment/reply')
    @UseInterceptors(TransactionInterceptor)
    async createReplyToComment(
        @Query('parentId') parentId: number,
        @Query('commentId') commentId: number,
        @Body() dto: CreateCommentDto,
        @QueryRunner() queryRunner: QR,
        @Ip() ip: string,
        @UserId() mbNo: number,
    ) {
        return this.service.createComment(
            parentId,
            dto,
            ip,
            mbNo,
            queryRunner,
            commentId,
        );
    }

    // 5) 목록
    @Get()
    async getPosts(@Query() dto: GetPostsDto) {
        return this.service.findAll(dto);
    }

    // 6) 상세
    @Get(':wrId')
    async getPost(@Param('wrId') wrId: number) {
        return this.service.findOne(wrId);
    }

    // 7) 수정
    @Patch()
    async updatePost(
        @Query('wrId') wrId: number,
        @Body() dto: UpdateWriteDto,
        @Ip() ip: string,
        @UserId() mbNo: number,
    ) {
        console.log('=== Controller updatePost ===');
        console.log('wrId:', wrId);
        console.log('dto:', dto);
        console.log('dto.keepFiles:', dto.keepFiles);
        console.log('dto.newFiles:', dto.newFiles);
        console.log('dto keys:', Object.keys(dto));
        await this.service.updatePost(wrId, dto, ip, mbNo);
        return wrId;
    }

    // 8) 삭제
    @Delete()
    async deletePost(
        @Query('wrId') wrId: number,
        @UserId() mbNo: number,
    ) {
        await this.service.deletePost(wrId, mbNo);
        return {ok: true};
    }
}
