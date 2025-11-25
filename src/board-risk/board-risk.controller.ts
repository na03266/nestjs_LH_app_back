import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { BoardRiskService } from './board-risk.service';
import {TransactionInterceptor} from "../common/interceptor/transaction.interceptor";
import {CreateBoardDto, CreateBoardReplyDto, CreateCommentDto} from "../board/dto/create-board.dto";
import {QueryRunner} from "../common/decorator/query-runner.decorator";
import {QueryRunner as QR} from "typeorm/query-runner/QueryRunner";
import {UserId} from "../user/decorator/user-id.decorator";
import {GetPostsDto} from "../board/dto/get-posts.dto";
import {UpdateBoardDto} from "../board/dto/update-board.dto";
import {FilesInterceptor} from "@nestjs/platform-express";

@Controller('board-risk')
export class BoardRiskController {
  constructor(private readonly service: BoardRiskService) {}

  // 새 글
  @Post()
  @UseInterceptors(TransactionInterceptor)
  async createPost(
      @Body() dto: CreateBoardDto,
      @QueryRunner() queryRunner: QR,
      @Ip() ip: string,
      @UserId() mbNo: number,
  ) {
    return await this.service.createPost(dto, ip, mbNo, queryRunner);
  }

  // 답글
  @Post('/reply')
  @UseInterceptors(TransactionInterceptor)
  async replyPost(
      @Query('parentId') parentId: number,
      @Body() dto: CreateBoardReplyDto,
      @QueryRunner() queryRunner: QR,
      @Ip() ip: string,
      @UserId() mbNo: number,
  ) {
    return await this.service.replyPost(parentId, dto, ip, mbNo, queryRunner);
  }

  // 댓글
  @Post('/comment')
  @UseInterceptors(TransactionInterceptor)
  async createComment(
      @Query('parentId') parentId: number,
      @Body() dto: CreateCommentDto,
      @QueryRunner() queryRunner: QR,
      @Ip() ip: string,
      @UserId() mbNo: number,
  ) {
    return await this.service.createComment(parentId, dto, ip, mbNo, queryRunner,);
  }

  // 대댓글
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
    return await this.service.createComment(parentId, dto, ip, mbNo, queryRunner, commentId);
  }

  @Get()
  async getPosts(
      @Query() dto: GetPostsDto,
  ) {
    return await this.service.findAll(dto);
  }

  @Get(':wrId')
  async getPost(
      @Param('wrId') wrId: number,
  ) {
    return await this.service.findOne(wrId);
  }


  // 수정
  @Patch()
  async updatePost(
      @Query('wrId') wrId: number,
      @Body() dto: UpdateBoardDto,
      @Ip() ip: string,
      @UserId() mbNo: number,
  ) {
    await this.service.updatePost(wrId, ip, dto, mbNo);
    return wrId;
  }

  // 파일 메타 업서트
  // 실제 파일 업로드(Multer)는 프로젝트 정책에 맞춰 별도 엔드포인트/스토리지 계층에서 처리 권장
  @Post(':wrId/files/meta')
  async upsertFileMeta(
      @Param('boTable') boTable: string,
      @Param('wrId') wrId: number,
      @Body() files: CreateBoardFileDto[] | { items: CreateBoardFileDto[] },
  ) {
    const items = Array.isArray(files) ? files : files.items;
    await this.service.upsertFiles(boTable, wrId, items);
    return {ok: true};
  }

  // 예시: 실제 업로드를 받는 엔드포인트(선택)
  // 프런트에서 saved/source 등 메타를 구성해 /meta로 전달하는 방식 추천
  @Post(':wrId/files')
  @UseInterceptors(FilesInterceptor('bf_file')) // 프런트 필드명 'bf_file[]'
  async uploadFiles(
      @Param('boTable') boTable: string,
      @Param('wrId') wrId: number,
      @UploadedFiles() files: Express.Multer.File[],
  ) {
    // 1) 파일명 위생처리·위험 확장자 대응
    // 2) 저장 후 saved/source/bytes/width/height/type 추출
    // 3) this.service.upsertFiles(...) 호출
    // 여기서는 골격만 제시
    const items: CreateBoardFileDto[] = (files ?? []).map((f, idx) => ({
      bfNo: idx,
      source: f.originalname,
      saved: f.filename,            // Multer storage에서 생성한 파일명
      bytes: f.size,
      // width/height/type은 image 검사 모듈로 추출해 채우기
    }));
    await this.service.upsertFiles(boTable, wrId, items);
    return {ok: true, count: items.length};
  }

  @Delete()
  async deletePost(
      @Param('wrId') wrId: number,
      @UserId() mbNo: number,
  ) {
    await this.service.deletePost(wrId, mbNo);
    return {ok: true};
  }


}
