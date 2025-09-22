import {MiddlewareConsumer, Module, NestModule, RequestMethod,} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import * as Joi from 'joi';
import {TypeOrmModule} from '@nestjs/typeorm';
import {APP_GUARD} from "@nestjs/core";
import {AuthGuard} from "./auth/guard/auth.guard";
import {RBACGuard} from "./auth/guard/rbac.guard";
import {BearerTokenMiddleware} from "./auth/middleware/bearer-token.middleware";
import {envVariables} from "./common/const/env.const";
import {UserModule} from './user/user.module';
import {AuthModule} from "./auth/auth.module";
import {NoticeModule} from './notice/notice.module';
import { ChatModule } from './chat/chat.module';

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
        OLLAMA_BASE_URL: Joi.string().required(),
        OLLAMA_MODEL: Joi.string().required(),
        UNIBOX_TOKEN_CODE: Joi.string().required(),
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
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }), 
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    NoticeModule,
    ChatModule,
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
