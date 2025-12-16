import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ScheduleModule} from '@nestjs/schedule';
import {FirebaseModule} from '../firebase/firebase.module';
import {DeviceToken} from './entities/device-token.entity';
import {PushLog} from './entities/push-log.entity';
import {PushService} from './push.service';
import {PushController} from './push.controller';
import {NotificationLog} from "../notification/entities/notification.entity";
import {User} from "../user/entities/user.entity";

@Module({
    imports: [
        FirebaseModule,
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([DeviceToken, PushLog, NotificationLog, User]),
    ],
    providers: [PushService],
    controllers: [PushController],
    exports: [PushService],
})
export class PushModule {
}