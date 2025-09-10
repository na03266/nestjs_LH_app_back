import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Headers,
	Post,
	Request,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserRole } from '../users/entities/user.entity';
import { JwtAuthGuard } from './strategy/jwt.strategy';
import { LocalAuthGuard } from './strategy/local.strategy';
import { Private, Public } from './decorator/public.decorator';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('user/register')
	// authorization: Basic
	registerUser(
		@Headers('Authorization') token: string,
		@Body() body: CreateUserDto,
	) {
		return this.authService.register(token, body);
	}

	@Public()
	@Post('admin/register')
	registerAdmin(
		@Headers('Authorization') token: string,
		@Body() body: CreateUserDto,
	) {
		body.role = UserRole.ADMIN;
		return this.authService.register(token, body);
	}

	@Public()
	@Post('login')
	loginUser(@Headers('Authorization') token: string) {
		return this.authService.login(token);
	}

	@Private()
	@Post('token/access')
	rotateAccessToken(@Request() req: any) {
		const user = {
			id: req.user.sub,
			...req.user,
		}
		return {
			accessToken: this.authService.issueToken(user, false),
		};
	}

	@UseGuards(LocalAuthGuard)
	@Post('login/passport')
	async loginUserPassport(@Request() req: any) {
		return {
			refreshToken: this.authService.issueToken(req.user, true),
			accessToken: this.authService.issueToken(req.user, false),
		};
	}

	@UseGuards(JwtAuthGuard)
	@Get('private')
	async private(@Request() req: any) {
		return this.authService.privateInfo(req);
	}
}
