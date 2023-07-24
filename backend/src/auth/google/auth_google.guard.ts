import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (err || !user) {
      console.log("GOOGLE - Client authentication failed due to unknown client, no client authentication included, or unsupported authentication method.");
      throw new UnauthorizedException("GOOGLE - Client authentication failed due to unknown client, no client authentication included, or unsupported authentication method.");
    }
    return user;
  }
}
