import {Body, Controller, Delete, Get, Param, Patch, Post, Request} from '@nestjs/common';
import {RoomService} from './room.service';
import {CreateRoomDto} from './dto/create-room.dto';
import {UpdateRoomDto} from './dto/update-room.dto';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {
  }

  @Post()
  create(@Body() createRoomDto: CreateRoomDto, @Request() req: any) {
    return this.roomService.create(createRoomDto, req);
  }

  @Get()
  findMyRooms(@Request() req:any) {
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
    return this.roomService.remove(id);
  }
}
