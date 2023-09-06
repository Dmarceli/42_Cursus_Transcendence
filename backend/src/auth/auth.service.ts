import { Injectable, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/db_interactions_modules/users/user.entity';
import { TwoFactorAuthService } from './2FA/2FA-service';
import { authenticator } from 'otplib';
import { resourceUsage } from 'process';
import { UsersService } from 'src/db_interactions_modules/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private twoFactorAuthService: TwoFactorAuthService,
    ) {}
   
  async login(user: User) {
    const infoToSend  = {
      intra_nick : user.intra_nick,
      nick : user.nick,
      id : user.id,
    }
    const payload = {
      user: infoToSend,
      id: user.id,
    };
    return {
      TwoFAEnabled: user.TwoFAEnabled,
      TwoFASecret: user.TwoFASecret,
      user: payload.user,
      id: payload.id,
      access_token: this.jwtService.sign(payload, {privateKey: `${process.env.JWT_SECRET_KEY}`,/*expiresIn: '30s'*/expiresIn: '1d'}),
    };
  }


  googleLogin(user: User) {
    const infoToSend  = {
      intra_nick : user.intra_nick,
      nick : user.nick,
      id : user.id
    }
    const payload = {
      user: infoToSend,
      id: user.id, 
      TwoFAEnabled: user.TwoFAEnabled
    };
    return {
      TwoFAEnabled: user.TwoFAEnabled,
      TwoFASecret: user.TwoFASecret,
      user: payload.user,
      id: payload.id,
      access_token: this.jwtService.sign(payload, {privateKey: `${process.env.JWT_SECRET_KEY}`,/*expiresIn: '30s'*/expiresIn: '1d'}),
    }
  }
}