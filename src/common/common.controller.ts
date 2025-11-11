import {Controller, Get, NotFoundException, Param, Post, Res, UploadedFile, UseInterceptors} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {join} from "path";
import * as fs from "node:fs";
import { Response as ExpressResponse } from 'express';

@Controller('common')
export class CommonController {

  @Post('file')
  @UseInterceptors(FileInterceptor('file',
    {
      limits: {
        fileSize: 2000000,
      },
    },
  ))
  createFile(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return {
      fileName: file.filename,
    };
  }
  @Post('file')
  @UseInterceptors(FileInterceptor('file',
    {
      limits: {
        fileSize: 2000000,
      },
    },
  ))
  downloadFile(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return {
      fileName: file.filename,
    };
  }

  // @Get('file/:fileName')
  // async download(
  //     @Param('fileName') fileName: string,
  //     @Res() res: ExpressResponse,
  // ) {
  //
  //   // 저장명은 DB에서 가져오는 것을 권장. 여기서는 단순화.
  //   const abs = join(process.cwd(), 'public', 'temp');
  //
  //   if (!fs.existsSync(abs)) throw new NotFoundException('file not found');
  //   const stat = fs.statSync(abs);
  //
  //   res.download(abs, originalName);      // 타입 에러 없이 안전
  //
  // }

  @Get('file/:savedName')
  async download(
      @Param('savedName') savedName: string,
      @Res() res: ExpressResponse,
  ) {
    // 디렉터리 트래버설 방지
    // if (!/^[A-Za-z0-9_\-\.]+$/.test(savedName)) {
    //   return res.status(400).json({ message: 'invalid file name' });
    // }
    const root = join(process.cwd(), 'public', 'temp')
    // 실제 파일 경로
    const abs = join(root, savedName);
    if (!fs.existsSync(abs)) {
      throw new NotFoundException('file not found');
    }

    // 원본 파일명은 DB에 bf_source로 보관해 꺼내 쓰는 게 정석
    // 데모로는 저장명을 그대로 다운로드 표시명에 사용
    const displayName = savedName;
    res.download(abs, displayName);
  }
}
