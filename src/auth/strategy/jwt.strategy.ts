import {AuthGuard, PassportStrategy} from "@nestjs/passport";
import {Injectable} from "@nestjs/common";
import {Strategy, ExtractJwt} from "passport-jwt";
import {ConfigService} from "@nestjs/config";

export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
        });
    }

    validate(payload: any) {
        return payload;
    }
}