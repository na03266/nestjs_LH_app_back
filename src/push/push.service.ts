import {Inject, Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';
import * as admin from 'firebase-admin';
import {FirebaseError} from 'firebase-admin';
import {DeviceToken} from './entities/device-token.entity';
import {PushLog} from './entities/push-log.entity';
import {RegisterTokenDto} from './dto/register-token.dto';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(
    @InjectRepository(DeviceToken) private readonly tokenRepo: Repository<DeviceToken>,
    @InjectRepository(PushLog) private readonly logRepo: Repository<PushLog>,
    @Inject('FIREBASE_ADMIN') private readonly fb: admin.app.App,
  ) {
  }

  async upsertToken(mbNo: number, dto: RegisterTokenDto) {
    const now = new Date();
    const found = await this.tokenRepo.findOne({where: {token: dto.token}});
    if (found) {
      found.mbNo = mbNo;
      found.platform = dto.platform;
      found.deviceId = dto.deviceId ?? found.deviceId;
      found.appVersion = dto.appVersion ?? found.appVersion;
      if (dto.optIn !== undefined) found.optIn = dto.optIn;
      found.lastSeenAt = now;
      await this.tokenRepo.save(found);
      return;
    }
    const row = this.tokenRepo.create({
      mbNo: mbNo,
      token: dto.token,
      platform: dto.platform,
      deviceId: dto.deviceId,
      appVersion: dto.appVersion,
      optIn: dto.optIn ?? true,
      lastSeenAt: now,
    });
    await this.tokenRepo.save(row);
  }

  async sendToUser(mbNo: number, title: string, body: string, data?: Record<string, string>) {
    const rows = await this.tokenRepo.find({where: {mbNo, optIn: true}});
    if (rows.length === 0) return {successCount: 0, failureCount: 0};

    const messaging = this.fb.messaging();
    const msg = this.buildMessageBase(title, body, data);
    const res = await messaging.sendEachForMulticast({
      tokens: rows.map(r => r.token),
      ...msg,
    });

    const invalid: string[] = [];
    res.responses.forEach((r, i) => {
      const token = rows[i].token;
      if (r.success) {
        this.logRepo.save(this.logRepo.create({
          mbNo, token, title, body, data: data, success: true,
        }));
      } else {
        const code = (r.error as any)?.code || (r.error as any)?.errorInfo?.code || 'unknown';
        const msg = (r.error as FirebaseError).message;
        this.logRepo.save(this.logRepo.create({
          mbNo, token, title, body, data: data, success: false, errorCode: code, errorMessage: msg,
        }));
        if (String(code).includes('registration-token-not-registered') || String(code).includes('invalid-argument')) {
          invalid.push(token);
        }
      }
    });
    if (invalid.length) await this.tokenRepo.delete({token: In(invalid)});
    return {successCount: res.successCount, failureCount: res.failureCount};
  }

  async sendToTopic(topic: string, title: string, body: string, data?: Record<string, string>) {
    const messaging = this.fb.messaging();
    const msg = this.buildMessageBase(title, body, data);
    const id = await messaging.send({topic, ...msg});
    await this.logRepo.save(this.logRepo.create({
      topic, title, body, data: data, success: true,
    }));
    return {messageId: id};
  }

  async validateToken(token: string) {
    try {
      await this.fb.messaging().send({token, notification: {title: 'validate', body: 'noop'}}, true);
      return {valid: true};
    } catch (e) {
      return {valid: false, reason: (e as Error).message};
    }
  }

  async subscribeUserToTopic(mbNo: number, topic: string) {
    const tokens = await this.tokenRepo.find({where: {mbNo: mbNo, optIn: true}});
    if (tokens.length === 0) return {subscribed: 0};
    const res = await this.fb.messaging().subscribeToTopic(tokens.map(t => t.token), topic);
    return {subscribed: res.successCount, failed: res.failureCount};
  }

  private buildMessageBase(title: string, body: string, data?: Record<string, string>) {
    const channelId = process.env.PUSH_ANDROID_CHANNEL_ID || 'default';
    return {
      notification: {title, body},
      data: data || {},
      android: {
        priority: 'high' as const,
        notification: {channelId},
        ttl: 3600 * 1000,
      },
      apns: {
        headers: {'apns-priority': '10'},
        payload: {aps: {sound: 'default'}},
      },
    };
  }
}