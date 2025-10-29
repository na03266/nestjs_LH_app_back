// src/firebase/firebase.module.ts
import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import {readFileSync} from "node:fs";

@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        // 서비스 계정은 환경변수/Secret Manager에서 로드하세요.
        const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH!;

        const svc = JSON.parse(readFileSync(path, 'utf8'));
        return admin.initializeApp({
          credential: admin.credential.cert(svc),
        });
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}
