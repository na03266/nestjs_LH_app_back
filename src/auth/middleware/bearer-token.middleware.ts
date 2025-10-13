import {BadRequestException, Inject, Injectable, NestMiddleware, UnauthorizedException,} from '@nestjs/common';
import {NextFunction, Request, Response} from 'express';
import {JwtService} from '@nestjs/jwt';
import {Cache, CACHE_MANAGER} from "@nestjs/cache-manager";

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService,
              @Inject(CACHE_MANAGER)
              private readonly cacheManager: Cache,) {
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      next();
      return;
    }
    const token = this.validateBearerToken(authHeader);

    const blockedToken = await this.cacheManager.get(`BLOCK_TOKEN_${token}`);

    if (blockedToken) throw new UnauthorizedException('차단된 사용자 입니다.');

    const tokenKey = `TOKEN_${token}`;

    const cachedPayload = await this.cacheManager.get(tokenKey);

    if (cachedPayload) {
      req.user = cachedPayload;
      return next();
    }
    const decodedPayload = this.jwtService.decode(token);

    if (decodedPayload.type !== 'refresh' && decodedPayload.type !== 'access') {
      throw new UnauthorizedException('토큰 포맷이 잘못됐습니다!');
    }

    try {


      const secretKey = decodedPayload.type === 'refresh'
        ? process.env.REFRESH_TOKEN_SECRET
        : process.env.ACCESS_TOKEN_SECRET;


      const payload = await this.jwtService.verify(token, {
        secret: secretKey,
      });

      /// payload['exp'] -> epoch time seconds
      const expiryDate = +new Date(payload['exp'] * 1000);
      const now = +Date.now();

      const differenceInSeconds = (expiryDate - now) / 1000;

      await this.cacheManager.set(tokenKey, payload, Math.min((differenceInSeconds - 30) * 1000, 1));

      req.user = payload;
      next();
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료 되었습니다.');
      }
      next();
    }
  }

  validateBearerToken(rawToken: string) {
    const bearerSplit = rawToken.split(' ');

    if (bearerSplit.length !== 2) {
      throw new BadRequestException('토큰 포멧이 잘못되었습니다.');
    }

    const [bearer, token] = bearerSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
    }
    return token;
  }
}
