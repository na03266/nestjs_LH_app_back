// 📌 플랫폼별 최적화 예시 (참고용)

import * as admin from 'firebase-admin';

class PushServiceEnhanced {

    // 옵션 1: 플랫폼별로 분리 전송
    async sendToUserOptimized(mbNo: number, title: string, body: string, data?: Record<string, string>) {
        const tokens = await this.getTokensByUser(mbNo);

        const iosTokens = tokens.filter(t => t.platform === 'ios');
        const androidTokens = tokens.filter(t => t.platform === 'android');

        const results = await Promise.allSettled([
            this.sendToIOS(iosTokens.map(t => t.token), title, body, data),
            this.sendToAndroid(androidTokens.map(t => t.token), title, body, data),
        ]);

        return results;
    }

    private async sendToIOS(tokens: string[], title: string, body: string, data?: Record<string, string>) {
        if (tokens.length === 0) return;

        return this.fb.messaging().sendEachForMulticast({
            tokens,
            apns: {
                headers: {
                    'apns-priority': '10',
                    // iOS만의 특별 기능
                    'apns-push-type': 'alert', // 'background', 'voip', 'complication', 'fileprovider', 'mdm'
                },
                payload: {
                    aps: {
                        alert: { title, body },
                        sound: 'default',
                        badge: 1,
                        // iOS 전용 옵션들
                        'thread-id': 'chat-thread-1', // 알림 그룹핑
                        'category': 'MESSAGE_CATEGORY', // 액션 버튼
                    },
                },
            },
            data: data || {},
        });
    }

    private async sendToAndroid(tokens: string[], title: string, body: string, data?: Record<string, string>) {
        if (tokens.length === 0) return;

        return this.fb.messaging().sendEachForMulticast({
            tokens,
            android: {
                priority: 'high',
                notification: {
                    title,
                    body,
                    channelId: 'default',
                    sound: 'default',
                    // Android 전용 옵션들
                    color: '#FF5722', // 알림 색상
                    icon: 'notification_icon', // 앱 리소스의 아이콘
                    tag: 'message', // 같은 tag는 하나만 표시 (덮어쓰기)
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                },
                ttl: 3600 * 1000,
            },
            data: data || {},
        });
    }

    // 옵션 2: 조건부 Critical Alert (iOS만)
    async sendUrgentNotification(mbNo: number, title: string, body: string) {
        const iosTokens = await this.getIOSTokens(mbNo);

        return this.fb.messaging().sendEachForMulticast({
            tokens: iosTokens,
            apns: {
                headers: {
                    'apns-priority': '10',
                },
                payload: {
                    aps: {
                        alert: { title, body },
                        sound: {
                            critical: 1, // 무음 모드에서도 울림
                            name: 'emergency.caf', // 커스텀 긴급 사운드
                            volume: 1.0,
                        },
                        badge: 1,
                    },
                },
            },
        });
    }

    // Helper 함수들
    private async getTokensByUser(mbNo: number) {
        // 구현 생략
        return [];
    }

    private async getIOSTokens(mbNo: number) {
        // 구현 생략
        return [];
    }

    private fb: admin.app.App = null as any; // 예시용
}

export default PushServiceEnhanced;
