import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/db_interactions_modules/users/user.entity';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { sign } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async login(user: User) {
    const payload = {
      login: user.intra_nick,
      id: user.id
    };

    console.log(payload)
    return {
      login: payload.login,
      id: payload.id,
      access_token: this.jwtService.sign(payload, {privateKey: `${process.env.JWT_SECRET_KEY}`,/*expiresIn: '30s'*/expiresIn: '1d'}),
    };
  }
}