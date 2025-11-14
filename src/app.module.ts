import {MiddlewareConsumer, Module, NestModule, RequestMethod,} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import * as Joi from 'joi';
import {TypeOrmModule} from '@nestjs/typeorm';
import {APP_FILTER, APP_GUARD, APP_INTERCEPTOR} from "@nestjs/core";
import {AuthGuard} from "./auth/guard/auth.guard";
import {RBACGuard} from "./auth/guard/rbac.guard";
import {BearerTokenMiddleware} from "./auth/middleware/bearer-token.middleware";
import {envVariables} from "./common/const/env.const";
import {UserModule} from './user/user.module';
import {AuthModule} from "./auth/auth.module";
import { ChatModule } from './chat/chat.module';
import {ScheduleModule} from "@nestjs/schedule";
import {CacheModule} from "@nestjs/cache-manager";
import {join} from "path";
import { ServeStaticModule } from "@nestjs/serve-static";
import { FirebaseModule } from './firebase/firebase.module';
import { PushModule } from './push/push.module';
import { BoardModule } from './board/board.module';
import { DepartmentModule } from './department/department.module';
import {ResponseTimeInterceptor} from "./common/interceptor/response-time.interceptor";
import {QueryFailedExceptionFilter} from "./common/filter/query-failed.filter";
import {ThrottleInterceptor} from "./common/interceptor/throttle.interceptor";
import { BoardNoticeModule } from './board-notice/board-notice.module';
import { SurveyModule } from './survey/survey.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev', 'prod').required(),
        DB_TYPE: Joi.string().valid('mysql').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        HASH_ROUNDS: Joi.number().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        SERVER_HOST: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>(envVariables.dbType) as 'mysql',
        host: configService.get<string>(envVariables.dbHost),
        port: configService.get<number>(envVariables.dbPort),
        username: configService.get<string>(envVariables.dbUsername),
        password: configService.get<string>(envVariables.dbPassword),
        database: configService.get<string>(envVariables.dbDatabase),
        serverHost: configService.get<string>(envVariables.serverHost),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }), 
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public/',
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    ChatModule,
    CacheModule.register({
      ttl: 3000,
      isGlobal: true,
    }),
    FirebaseModule,
    PushModule,
    BoardModule,
    DepartmentModule,
    BoardNoticeModule,
    SurveyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RBACGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: QueryFailedExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ThrottleInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BearerTokenMiddleware)
      .exclude(
        {
          path: '/auth/login',
          method: RequestMethod.POST,
        },
        {
          path: '/auth/admin/register',
          method: RequestMethod.POST,
        },
        {
          path: '/auth/user/register',
          method: RequestMethod.POST,
        },
      )
      .forRoutes('*');
  }
}
