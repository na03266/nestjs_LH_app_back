import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import { FirebaseError } from 'firebase-admin';
import { DeviceToken } from './entities/device-token.entity';
import { PushLog } from './entities/push-log.entity';
import { RegisterTokenDto } from './dto/register-token.dto';
import { NotificationLog } from "../notification/entities/notification.entity";
import { User } from "../user/entities/user.entity";

@Injectable()
export class PushService {
    private readonly logger = new Logger(PushService.name);

    constructor(
        @InjectRepository(DeviceToken) private readonly tokenRepo: Repository<DeviceToken>,
        @InjectRepository(PushLog) private readonly logRepo: Repository<PushLog>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(NotificationLog) private readonly notificationRepo: Repository<NotificationLog>,
        @Inject('FIREBASE_ADMIN') private readonly fb: admin.app.App,
    ) {
    }

    async upsertToken(mbNo: number, dto: RegisterTokenDto) {
        const now = new Date();
        const found = await this.tokenRepo.findOne({ where: { token: dto.token } });
        if (found) {
            this.logger.log(`[Token] Updating token for user ${mbNo}, platform: ${dto.platform} (was: ${found.platform})`);
            found.mbNo = mbNo;
            found.platform = dto.platform;
            found.deviceId = dto.deviceId ?? found.deviceId;
            found.appVersion = dto.appVersion ?? found.appVersion;
            if (dto.optIn !== undefined) found.optIn = dto.optIn;
            found.lastSeenAt = now;
            await this.tokenRepo.save(found);
            return;
        }
        this.logger.log(`[Token] Registering NEW token for user ${mbNo}, platform: ${dto.platform}`);
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
        const rows = await this.tokenRepo.find({ where: { mbNo, optIn: true } });
        if (rows.length === 0) return { successCount: 0, failureCount: 0 };

        // 플랫폼별 토큰 확인 (디버깅용)
        const platforms = rows.map(r => r.platform);
        this.logger.log(`[Push] Sending to user ${mbNo}, platforms: ${platforms.join(', ')}`);

        const messaging = this.fb.messaging();
        const msg = this.buildMessageBase(title, body, data);

        // iOS 디버깅: APNs 페이로드 확인
        this.logger.debug(`[Push] APNs payload: ${JSON.stringify(msg.apns, null, 2)}`);

        const res = await messaging.sendEachForMulticast({
            tokens: rows.map(r => r.token),
            ...msg,
        });

        const invalid: string[] = [];
        res.responses.forEach((r, i) => {
            const token = rows[i].token;
            const platform = rows[i].platform;
            if (r.success) {
                this.logger.log(`[Push] ✓ Success to ${platform} token: ${token.substring(0, 20)}...`);
                this.logRepo.save(this.logRepo.create({
                    mbNo, token, title, body, data: data, success: true,
                }));
                this.notificationRepo.save({ mbNo, title, body, data: data, })
            } else {
                const code = (r.error as any)?.code || (r.error as any)?.errorInfo?.code || 'unknown';
                const msg = (r.error as FirebaseError).message;
                this.logger.error(`[Push] ✗ Failed to ${platform} token: ${code} - ${msg}`);
                this.logRepo.save(this.logRepo.create({
                    mbNo, token, title, body, data: data, success: false, errorCode: code, errorMessage: msg,
                }));
                if (String(code).includes('registration-token-not-registered') || String(code).includes('invalid-argument')) {
                    invalid.push(token);
                }
            }
        });
        if (invalid.length) await this.tokenRepo.delete({ token: In(invalid) });
        return { successCount: res.successCount, failureCount: res.failureCount };
    }

    async sendToTopic(topic: string, title: string, body: string, data?: Record<string, any>) {
        const messaging = this.fb.messaging();
        const msg = this.buildMessageBase(title, body, data);
        const id = await messaging.send({ topic, ...msg });
        await this.logRepo.save(this.logRepo.create({
            topic, title, body, data: data, success: true,
        }));

        if (topic === 'all') {
            await this.notificationRepo.insert({
                mbNo: null,
                title,
                body,
                data,
                isRead: false,
            });
            return { messageId: id };
        }

        const tokenRows = await this.tokenRepo.find({
            where: { optIn: true },
            select: ['mbNo'],
        });
        const candidateMbNos = [...new Set(tokenRows.map(r => r.mbNo))];

        let targetMbNos: number[] = [];

        if (topic === 'office') {
            // 직무명 mb5가 행정/경영지원/안전관리
            const officeJobs = ['행정', '경영지원', '안전관리'];

            const users = await this.userRepo.find({
                where: { mbNo: In(candidateMbNos), mb5: In(officeJobs) },
                select: ['mbNo'],
            });
            targetMbNos = users.map(u => u.mbNo);
        } else if (topic === 'tech') {
            // officeJobs 제외
            const officeJobs = ['행정', '경영지원', '안전관리'];

            const users = await this.userRepo
                .createQueryBuilder('u')
                .select(['u.mbNo'])
                .where('u.mbNo IN (:...mbNos)', { mbNos: candidateMbNos })
                .andWhere('(u.mb5 IS NULL OR u.mb5 NOT IN (:...officeJobs))', { officeJobs })
                .getMany();

            targetMbNos = users.map(u => u.mbNo);
        } else {
            // topic이 부서(deptSite) 코드/명이라고 가정
            const users = await this.userRepo.find({
                where: { mbNo: In(candidateMbNos), deptSite: { id: Number(topic) } },
                select: ['mbNo'],
            });
            targetMbNos = users.map(u => u.mbNo);
        }
        // 3) NotificationLog(개인별 알림함 row) bulk insert
        if (targetMbNos.length) {
            const payload = targetMbNos.map(mbNo => ({
                mbNo,
                title,
                body,
                data, // 알림 클릭/추적용
                isRead: false,
                readAt: null,
            }));

            await this.notificationRepo.insert(payload);
        }
        return { messageId: id };
    }

    async validateToken(token: string) {
        try {
            await this.fb.messaging().send({ token, notification: { title: 'validate', body: 'noop' } }, true);
            return { valid: true };
        } catch (e) {
            return { valid: false, reason: (e as Error).message };
        }
    }

    async subscribeUserToTopic(mbNo: number, topic: string) {
        const tokens = await this.tokenRepo.find({ where: { mbNo: mbNo, optIn: true } });
        if (tokens.length === 0) return { subscribed: 0 };
        const res = await this.fb.messaging().subscribeToTopic(tokens.map(t => t.token), topic);
        return { subscribed: res.successCount, failed: res.failureCount };
    }

    private buildMessageBase(title: string, body: string, data?: Record<string, string>) {
        const channelId = process.env.PUSH_ANDROID_CHANNEL_ID || 'default';
        return {
            notification: { title, body },
            data: data || {},
            android: {
                priority: 'high' as const,
                notification: { channelId, sound: 'default' },
                ttl: 3600 * 1000,
            },
            apns: {
                headers: { 'apns-priority': '10' },
                payload: {
                    aps: {
                        alert: {
                            title,
                            body,
                        },
                        sound: 'default',
                        badge: 1, // iOS 뱃지 카운트
                        // 중요: critical 옵션은 무음 모드에서도 소리가 나지만, 
                        // 앱에서 특별 권한(Critical Alerts Entitlement)이 필요합니다
                        // 'critical': 1,
                        // 'sound': { critical: 1, name: 'default', volume: 1.0 },
                    },
                },
            },
        };
    }
}