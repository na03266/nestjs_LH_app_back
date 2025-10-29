import {Injectable, Logger} from '@nestjs/common';
import {Cron, SchedulerRegistry} from '@nestjs/schedule';
import {readdir, unlink} from 'fs/promises';
import {join, parse} from 'path';
import * as process from 'node:process';
import {LessThan, Repository} from "typeorm";
import {DeviceToken} from "../push/entities/device-token.entity";
import {InjectRepository} from "@nestjs/typeorm";

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    @InjectRepository(DeviceToken) private readonly repo: Repository<DeviceToken>
  ) {
  }

  @Cron('0 4 * * *')
  async run() {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 3600 * 1000);
    await this.repo.delete({optIn: false, lastSeenAt: LessThan(ninetyDaysAgo)});
  }

  // @Cron('*/5 * * * * *')
  logEverySecond() {
    this.logger.fatal('1초마다 실행'); // 당장 해결해야하는문제
    this.logger.debug('DEBUG 레벨 로그'); // 실제 에러
    this.logger.warn('DEBUG 레벨 로그'); // 좋지않으나 실행은 가능
    this.logger.log('DEBUG 레벨 로그'); // 정보성
    this.logger.debug('DEBUG 레벨 로그'); // 궁금해서
    this.logger.verbose('DEBUG 레벨 로그');
  }

  // @Cron('* * * * * *')
  async eraseOrphanFiles() {
    const files = await readdir(join(process.cwd(), 'public', 'temp'));
    const deleteFilesTargets = files.filter(file => {
      const filename = parse(file).name;
      const split = filename.split('_');
      if (split.length !== 2) {
        return true;
      }

      try {
        const date = +new Date(parseInt(split[split.length - 1]));
        const aDayInMilSec = (24 * 60 * 60 * 1000);
        const now = +new Date();

        return (now - date) > aDayInMilSec;

      } catch (e) {
        return true;
      }

    });

    await Promise.all(
      deleteFilesTargets.map(
        (x) => unlink(join(process.cwd(), 'public', 'temp', x)),
      ),
    );
  }

  // @Cron('0 * * * * *')
  // async calculateMovieLikeCounts() {
  //   await this.movieRepository.query(
  //     `
  //         update movie m
  //         set "likeCount" = (select count(*)
  //                            from movie_user_like mul
  //                            where m.id = mul."movieId"
  //                              and mul."isLike" = true)`,
  //   );
  //   await this.movieRepository.query(
  //     `
  //         update movie m
  //         set "dislikeCount" = (select count(*)
  //                               from movie_user_like mul
  //                               where m.id = mul."movieId"
  //                                 and mul."isLike" = false)`,
  //   );
  // }

  // @Cron('* * * * * *', {
  //   name: 'printer',
  // })
  printer() {
    console.log('print every seconds');
  }

  // @Cron('*/5 * * * * *')
  stopper() {
    console.log('stop run');

    const job = this.schedulerRegistry.getCronJob('printer');

    // console.log(job.lastDate());
    // console.log(job.nextDate());
    // console.log(job.nextDates(5));

    if (job.isActive) {
      job.stop();
    } else {
      job.start();
    }
  }
}