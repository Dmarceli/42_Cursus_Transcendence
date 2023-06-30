import { Injectable, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/db_interactions_modules/users/user.entity';
import { UsersService } from 'src/db_interactions_modules/users/users.service';

import { TwoFactorAuthService } from './2FA/2FA-service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private twoFactorAuthService: TwoFactorAuthService,
  ) {}
  async login(user: User) {
    const payload = {
      login: user.intra_nick,
      id: user.id,
      TwoFAEnabled: user.TwoFAEnabled
    };
    if(payload.TwoFAEnabled){
      const { secret, otpAuthUrl } = await this.twoFactorAuthService.generateTwoFactorAuthSecret(user);
      return this.twoFactorAuthService.GenerateqrCode(otpAuthUrl)
    }
    return {
      login: payload.login,
      id: payload.id,
      access_token: this.jwtService.sign(payload, {privateKey: `${process.env.JWT_SECRET_KEY}`,/*expiresIn: '30s'*/expiresIn: '1d'}),
    };
  }
  googleLogin(@Req() req:any) {
    const payload = {
      login: req.user.intra_nick,
      id: req.user.id
    };
    return {
      message: 'User information from google',
      user: req.user,
      access_token: this.jwtService.sign(payload, {privateKey: `${process.env.JWT_SECRET_KEY}`,/*expiresIn: '30s'*/expiresIn: '1d'}),
    }
  }
}