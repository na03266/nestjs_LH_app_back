import {Controller, Get, Param, Query, Res} from '@nestjs/common';
import {SalaryService} from './salary.service';
import {UserId} from "../user/decorator/user-id.decorator";
import {Response} from 'express';

@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}


  @Get()
  async findAll(
      @UserId() mbNo: number,
      @Query('year') year?: string,
  ) {
    const yearNum = year ? Number(year) : undefined;
    return await this.salaryService.findAll(mbNo, yearNum);
  }


  @Get('html/:saId')
  async getSalaryHtml(
      @UserId() mbNo: number,
      @Param('saId') saId: number,
      @Res() res: Response,
  ) {
    const html = await this.salaryService.generateSalaryHtml(mbNo, saId);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
