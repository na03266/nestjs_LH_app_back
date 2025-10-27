import {Module} from '@nestjs/common';
import {CommonService} from './common.service';
import {CommonController} from './common.controller';
import {v4} from 'uuid';
import {join} from 'path';
import {diskStorage} from 'multer';
import {MulterModule} from '@nestjs/platform-express';
import {TasksService} from './tasks.service';

@Module({
    imports: [
      MulterModule.register({
        storage: diskStorage({
          destination: join(process.cwd(), 'public', 'temp'),
          filename: (req, file, cb) => {
            const split = file.originalname.split('.');

            let extension = 'mp4';

            let filename = '';
            if (split.length > 1) {
              extension = split[split.length - 1];
              filename = split[0];
            }

            cb(null, `${v4()}_${Date.now()}_${filename}.${extension}`);
          },
        }),
      }),
    ],
    controllers: [CommonController],
    providers: [CommonService, TasksService],
    exports: [CommonService],
  },
)
export class CommonModule {
}