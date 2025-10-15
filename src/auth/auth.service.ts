import {BadRequestException, Inject, Injectable, UnauthorizedException,} from '@nestjs/common';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {ConfigService} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import {envVariables} from '../common/const/env.const';
import {mysql41PasswordVerify} from "./hash/hash";
import {User} from "../user/entities/user.entity";
import {Cache, CACHE_MANAGER} from "@nestjs/cache-manager";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
  }

  async tokenBlock(token: string) {

    const payload = this.jwtService.decode(token);
    const expiryDate = +new Date(payload['exp'] * 1000);
    const now = +Date.now();

    const differenceInSeconds = (expiryDate - now) / 1000;

    await this.cacheManager.set(`BLOCK_TOKEN_${token}`, payload, Math.min(differenceInSeconds * 1000, 1));

    return true;
  }

  parseBasicToken(rawToken: string) {
    const basicSplit = rawToken.split(' ');

    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포멧이 잘못되었습니다.');
    }

    const [basic, token] = basicSplit;

    if (basic.toLowerCase() !== 'basic') {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
    }

    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const tokenSplit = decoded.split(':');

    if (tokenSplit.length !== 2) {
      throw new BadRequestException('토큰 포멧이 잘못되었습니다.');
    }
    const [mbId, password] = tokenSplit;

    return {
      mbId,
      password,
    };
  }

  parseBearerToken(rawToken: string, isRefreshToken: boolean) {
    const bearerSplit = rawToken.split(' ');

    if (bearerSplit.length !== 2) {
      throw new BadRequestException('토큰 포멧이 잘못되었습니다.');
    }

    const [bearer, token] = bearerSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>(
          isRefreshToken
            ? envVariables.refreshTokenSecret
            : envVariables.accessTokenSecret,
        ),
      });
      if (isRefreshToken) {
        if (payload.type !== 'refresh') {
          throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
        }
      } else {
        if (payload.type !== 'access') {
          throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
        }
      }
      return payload;
    } catch (e) {
      throw new UnauthorizedException('토큰 만료 되었습니다.');
    }
  }

  async authenticate(mbId: string, mbPassword: string) {
    const user = await this.userRepository.findOne({
      where: {mbId: mbId},
    });
    if (!user) {

      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }

    if (typeof user.mbPassword !== "string") {

      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }

    // const passOk = await bcrypt.compare(password, user.password);
    const passOk = mysql41PasswordVerify(mbPassword, user.mbPassword!);

    if (!passOk) {
      console.log('123');

      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }

    return user;
  }

  async issueToken(
    user: {
      mbNo: number;
    },
    isRefreshToken: boolean,
  ) {
    const refreshTokenSecret = this.configService.get<string>(
      envVariables.refreshTokenSecret,
    );
    const accessTokenSecret = this.configService.get<string>(
      envVariables.accessTokenSecret,
    );

    return await this.jwtService.signAsync(
      {
        sub: user.mbNo,
        type: isRefreshToken ? 'refresh' : 'access',
      },
      {
        secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
        expiresIn: isRefreshToken ? '1y' : '2w',
      },
    );
  }

  async login(rawToken: string) {
    const {mbId, password} = this.parseBasicToken(rawToken);
    const user = await this.authenticate(mbId, password);

    return {
      refreshToken: await this.issueToken(user, true),
      accessToken: await this.issueToken(user, false),
    };
  }

  async privateInfo(req: any) {
    const user = await this.userRepository.findOne({
      where: {mbNo: req.user.sub},
    });

    if (!req.user) {
      throw new UnauthorizedException('인증되지 않은 사용자입니다.');
    }
    return user;
  }
}
