import {Controller, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';

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
  createVideo(
    @UploadedFile() movie: Express.Multer.File,
  ) {
    return {
      fileName: movie.filename,
    };
  }

}
