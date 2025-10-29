import {Body, Controller, Param, Post} from '@nestjs/common';
import {PushService} from './push.service';
import {RegisterTokenDto} from './dto/register-token.dto';
import {SendToUserDto} from './dto/send-to-user.dto';
import {SendToTopicDto} from './dto/send-to-topic.dto';
import {UserId} from "../user/decorator/user-id.decorator";

// 예시: 관리자 가드는 프로젝트 환경에 맞게 교체

@Controller('push')
export class PushController {
  constructor(private readonly push: PushService) {}

  @Post('register')
  async register(@UserId() mbNo: number, @Body() dto: RegisterTokenDto) {
    await this.push.upsertToken(mbNo, dto);
    return { ok: true };
  }

  @Post('send/user')
  async sendToUser(@Body() dto: SendToUserDto) {
    const res = await this.push.sendToUser(dto.mbNo, dto.title, dto.body, dto.data);
    return res;
  }

  @Post('send/topic')
  async sendToTopic(@Body() dto: SendToTopicDto) {
    return await this.push.sendToTopic(dto.topic, dto.title, dto.body, dto.data);
  }

  @Post('validate/:token')
  async validate(@Param('token') token: string) {
    return this.push.validateToken(token);
  }

  @Post('subscribe/:userId/:topic')
  async subscribe(@Param('userId') userId: number, @Param('topic') topic: string) {
    return this.push.subscribeUserToTopic(userId, topic);
  }
}