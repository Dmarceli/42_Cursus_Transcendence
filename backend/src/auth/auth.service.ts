import { Injectable, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/db_interactions_modules/users/user.entity';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { TwoFactorAuthService } from './2FA/2FA-service';
import { authenticator } from 'otplib';
import { resourceUsage } from 'process';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private twoFactorAuthService: TwoFactorAuthService,
    ) {}
   
  async login(user: User) {
    const payload = {
      user: user,
      id: user.id,
      TwoFAEnabled: user.TwoFAEnabled
    };
    return {
      user: payload.user,
      id: payload.id,
      access_token: this.jwtService.sign(payload, {privateKey: `${process.env.JWT_SECRET_KEY}`,/*expiresIn: '30s'*/expiresIn: '1d'}),
    };
  }


  googleLogin(@Req() req:any) {
    const payload = {
      user: req.user,
      id: req.user.id, 
      TwoFAEnabled: req.user.TwoFAEnabled
    };
    return {
      user: payload.user,
      id: payload.id,
      access_token: this.jwtService.sign(payload, {privateKey: `${process.env.JWT_SECRET_KEY}`,/*expiresIn: '30s'*/expiresIn: '1d'}),
    }
  }
}