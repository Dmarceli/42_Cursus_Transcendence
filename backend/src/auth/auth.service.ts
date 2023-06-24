import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/db_interactions_modules/users/user.entity';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  /*******************************************/
  /***            Login Logic              ***/
  /*******************************************/

  async login(user: User) {
    const payload = {
      login: user.intra_nick,
      secretOrKey: 'secret',
    };

    console.log(payload)
    return {
      login: payload.login,
      access_token: this.jwtService.sign(payload),
    };
  }
}