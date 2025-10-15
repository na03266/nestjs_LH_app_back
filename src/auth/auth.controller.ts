import {ClassSerializerInterceptor, Controller, Get, Post, Request, UseGuards, UseInterceptors,} from '@nestjs/common';
import {AuthService} from './auth.service';
import {JwtAuthGuard} from './strategy/jwt.strategy';
import {LocalAuthGuard} from './strategy/local.strategy';
import {Private, Public} from './decorator/public.decorator';
import {Authorization} from "./decorator/authorization.decorator";

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Public()
  @Post('login')
  async loginUser(@Authorization() token: string) {
    return await this.authService.login(token);
  }

  @Private()
  @Post('token/access')
  async rotateAccessToken(@Request() req: any) {
    const user = {
      mbNo: req.user.sub,
    }
    return {
      accessToken: await this.authService.issueToken(user, false),
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login/passport')
  async loginUserPassport(@Request() req: any) {
    return {
      refreshToken: await this.authService.issueToken(req.user, true),
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  async private(@Request() req: any) {
    return this.authService.privateInfo(req);
  }
}
