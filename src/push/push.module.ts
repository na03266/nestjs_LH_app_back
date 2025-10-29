import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { FirebaseModule } from '../firebase/firebase.module';
import { DeviceToken } from './entities/device-token.entity';
import { PushLog } from './entities/push-log.entity';
import { PushService } from './push.service';
import { PushController } from './push.controller';

@Module({
  imports: [
    FirebaseModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([DeviceToken, PushLog]),
  ],
  providers: [PushService],
  controllers: [PushController],
  exports: [PushService],
})
export class PushModule {}