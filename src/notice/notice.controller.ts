import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { PagePaginationDto } from '../common/dto/page-pagination.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard/auth.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('공지사항')
@Controller('notice')
@UseGuards(AuthGuard)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  @ApiOperation({ summary: '공지사항 목록 조회' })
  @ApiResponse({ status: 200, description: '공지사항 목록 조회 성공' })
  async findAll(@Query() dto: PagePaginationDto) {
    return await this.noticeService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '공지사항 상세 조회' })
  @ApiResponse({ status: 200, description: '공지사항 상세 조회 성공' })
  async findOne(@Param('id') id: string) {
    return await this.noticeService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: '공지사항 글 생성' })
  @ApiResponse({ status: 201, description: '공지사항 글 생성 성공' })
  async create(@Body() createData: any) {
    return await this.noticeService.create(createData);
  }

  @Patch(':id')
  @ApiOperation({ summary: '공지사항 글 업데이트' })
  @ApiResponse({ status: 200, description: '공지사항 글 업데이트 성공' })
  async update(@Param('id') id: string, @Body() updateData: any) {
    return await this.noticeService.update(+id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: '공지사항 글 삭제' })
  @ApiResponse({ status: 200, description: '공지사항 글 삭제 성공' })
  async delete(@Param('id') id: string) {
    return await this.noticeService.delete(+id);
  }
}
