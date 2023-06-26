import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from 'src/db_interactions_modules/users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private userService: UsersService) {
    super();
  }
  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    done(null, user.intra_nick.toString());
  }
  
  async deserializeUser(
    payload: any,
    done: (err: Error, user: any) => void,
  ): Promise<any> {
    const user = await this.userService.findByLogin(payload);
    if (!user) {
      done(null, null);
    }
    done(null, user);
  }
}