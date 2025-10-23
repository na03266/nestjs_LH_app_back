import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors
} from '@nestjs/common';
import {ChatRoomService} from './chat-room.service';
import {UpdateRoomDto} from './dto/update-room.dto';
import {CreateChatRoomDto} from "./dto/create-chat-room.dto";
import {UserId} from "../../user/decorator/user-id.decorator";
import {TransactionInterceptor} from "../../common/interceptor/transaction.interceptor";
import {QueryRunner} from "../../common/decorator/query-runner.decorator";
import {QueryRunner as QR} from "typeorm";
import {GetChatRoomsDto} from "./dto/get-chat-rooms.dto";
import {AddMembersDto} from "./dto/add-members.dto";

@UseInterceptors(ClassSerializerInterceptor)
@Controller('room')
export class ChatRoomController {
  constructor(private readonly roomService: ChatRoomService) {
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  create(
    @Body() createRoomDto: CreateChatRoomDto,
    @QueryRunner() queryRunner: QR,
    @UserId() mbId: number,
  ) {
    // 커서 생성, 메시지 생성 등 트랜잭션 처리 필요
    return this.roomService.create(createRoomDto, mbId, queryRunner);
  }

  @Get()
  findMyRooms(
    @UserId() mbNo: number,
    @Query() dto: GetChatRoomsDto,
  ) {
    return this.roomService.findMyRooms(mbNo, dto);
  }

  @Get(':id')
  findOne(
    @UserId() mbNo: number,
    @Param('id') roomId: string,
  ) {
    return this.roomService.findOne(+roomId, mbNo);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @UserId() mbNo: number,
    @Body() updateRoomDto: UpdateRoomDto,
    ) {
    return this.roomService.update(id, updateRoomDto, mbNo);
  }

  @Patch(':id/add-member')
  @UseInterceptors(TransactionInterceptor)
  addMembers(
    @Param('id') id: string,
    @QueryRunner() qr: QR,
    @Body() addMembersDto: AddMembersDto,
  ) {
    return this.roomService.addMember(id, addMembersDto, qr);
  }


  @Delete(':id')
  remove(
    @Param('id') id: string,
    @UserId() mbNo: number
  ) {
    return this.roomService.remove(+id, mbNo);
  }
}
