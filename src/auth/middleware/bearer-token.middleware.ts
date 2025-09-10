import {
	BadRequestException,
	Injectable,
	NestMiddleware,
	UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
	constructor(private readonly jwtService: JwtService) {}

	use(req: Request, res: Response, next: NextFunction) {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			next();
			return;
		}

		try {
			const token = this.validateBearerToken(authHeader);
			const decodedPayload = this.jwtService.decode(token);

			if (decodedPayload == 'refresh' && decodedPayload == 'access') {
				throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
			}

			const secretKey =
				decodedPayload.type === 'refresh'
					? process.env.REFRESH_TOKEN_SECRET
					: process.env.ACCESS_TOKEN_SECRET;

			req.user = this.jwtService.verify(token, {
				secret: secretKey,
			});

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
