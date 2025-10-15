import {Body, Controller, Delete, Param, Post, UseInterceptors} from '@nestjs/common';
import {MessagesService} from './messages.service';
import {CreateMessageDto} from './dto/create-message.dto';
import {UserId} from "../../user/decorator/user-id.decorator";
import {TransactionInterceptor} from "../../common/interceptor/transaction.interceptor";
import {QueryRunner} from "../../common/decorator/query-runner.decorator";
import {QueryRunner as QR} from "typeorm/query-runner/QueryRunner";

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  create(
    @Body() createMessageDto: CreateMessageDto,
    @QueryRunner() queryRunner: QR,
    @UserId() mbNo: number,
  ) {
    return this.messagesService.create(mbNo, createMessageDto, queryRunner);
  }

  @Delete(':id')
  remove(@Param('id') id: string,
         @UserId() mbNo: number) {
    return this.messagesService.remove(id, mbNo);
  }
}
