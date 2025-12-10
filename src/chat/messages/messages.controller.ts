import {Body, Controller, Delete, Get, Param, Post, Query, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {MessagesService} from './messages.service';
import {CreateMessageDto} from './dto/create-message.dto';
import {UserId} from "../../user/decorator/user-id.decorator";
import {TransactionInterceptor} from "../../common/interceptor/transaction.interceptor";
import {QueryRunner} from "../../common/decorator/query-runner.decorator";
import {QueryRunner as QR} from "typeorm/query-runner/QueryRunner";
import {FileFieldsInterceptor} from "@nestjs/platform-express";
import {GetMessagesDto} from "./dto/get-messages.dto";

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FileFieldsInterceptor(
    [{name: 'files', maxCount: 10},],
    {limits: {fileSize: 50 * 1024 * 1024}})
  )
  create(
    @Body() createMessageDto: CreateMessageDto,
    @UploadedFiles() files: {files?: Express.Multer.File[]},
    @QueryRunner() queryRunner: QR,
    @UserId() mbNo: number,
  ) {
    // 파일 업로드 로직과 연결,
    return this.messagesService.create(mbNo, createMessageDto, queryRunner);
  }

  @Get()
  async getMessages(
      @Query() dto: GetMessagesDto,
      @UserId() mbNo: number,
  ) {
    return this.messagesService.getMessages(dto, mbNo);
  }
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @UserId() mbNo: number
  ) {
    return this.messagesService.remove(id, mbNo);
  }
}
