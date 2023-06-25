import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from 'src/db_interactions_modules/users/users.service';

export interface TokenPayload {
  iat: number;
  exp: number;
  login: string;
  isTwoFactorAuthenticated?: boolean;
  isTwoFactorAuthenticationEnabled: boolean;
}

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: TokenPayload) {
    console.log('\nJwt Strategy 1st');
    console.log(payload);

    const user = await this.userService.findByLogin(payload.login);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}