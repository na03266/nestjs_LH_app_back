import {Body, Controller, Delete, Get, Param, Patch, Post, Request, UseInterceptors} from '@nestjs/common';
import {ChatRoomService} from './chat-room.service';
import {UpdateRoomDto} from './dto/update-room.dto';
import {CreateChatRoomDto} from "./dto/create-chat-room.dto";
import {UserId} from "../../user/decorator/user-id.decorator";
import {TransactionInterceptor} from "../../common/interceptor/transaction.interceptor";
import {QueryRunner} from "../../common/decorator/query-runner.decorator";
import {QueryRunner as QR} from "typeorm";

@Controller('room')
export class ChatRoomController {
  constructor(private readonly roomService: ChatRoomService) {
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  create(@Body() createRoomDto: CreateChatRoomDto, @QueryRunner() queryRunner: QR,
         @UserId() mbId: number) {
    // 커서 생성, 메시지 생성 등 트랜잭션 처리 필요
    return this.roomService.create(createRoomDto, mbId, queryRunner);
  }

  @Get()
  findMyRooms(@Request() req: any) {
    return this.roomService.findMyRooms(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }
}
