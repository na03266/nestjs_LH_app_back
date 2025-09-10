import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { PagePaginationDto } from '../common/dto/page-pagination.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('notice')
@UseGuards(AuthGuard)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async findAll(@Query() dto: PagePaginationDto) {
    return await this.noticeService.findAll(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.noticeService.findOne(+id);
  }

  @Post()
  async create(@Body() createData: any) {
    return await this.noticeService.create(createData);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return await this.noticeService.update(+id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.noticeService.delete(+id);
  }
}
