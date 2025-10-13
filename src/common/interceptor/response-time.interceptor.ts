import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { delay, Observable, tap } from 'rxjs';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    const reqTime = Date.now();
    return next.handle()
      .pipe(
        tap(() => {
          const resTime = Date.now();
          console.log(`${req.method} ${req.url} ${resTime - reqTime}ms`);
        }),
      );
  }
}