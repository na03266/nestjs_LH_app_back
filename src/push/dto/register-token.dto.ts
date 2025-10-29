import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterTokenDto {
  @IsString() @IsNotEmpty()
  token: string;

  @IsIn(['ios', 'android', 'web'])
  platform: 'ios' | 'android' | 'web';

  @IsOptional() @IsString()
  deviceId?: string;

  @IsOptional() @IsString()
  appVersion?: string;

  @IsOptional() @IsBoolean()
  optIn?: boolean;
}