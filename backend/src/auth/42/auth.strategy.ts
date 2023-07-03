import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-42';
import { CreateUserDto } from 'src/db_interactions_modules/users/dtos/user.dto';
import { UsersService } from 'src/db_interactions_modules/users/users.service';

@Injectable()
export class FortyTwoAuthStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private userService: UsersService) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.INTRA_CLIENT_ID,
      clientSecret: process.env.INTRA_CLIENT_SECRET,
      callbackURL: process.env.INTRA_REDIRECT_URI,
    });
  }
  
  async validate(accessToken: string,refreshToken: string,profile: Profile,): Promise<any> {

    const user = await this.userService.findByLogin(profile._json.login);

    if (user) {
      console.log('User already exists!');
      return user;
    }
    
    const newUser: CreateUserDto = {
      // id: profile.id,
      // email: profile._json.email,
      nick: profile._json.login,
      intra_nick: profile._json.login,
      avatar: profile._json.image.link,
      // first_name: profile._json.first_name,
      // last_name: profile._json.last_name,
      // twoFactorAuthenticationSecret: '',
      // isTwoFactorAuthenticationEnabled: false,
    };
    const savedUser = this.userService.createUser(newUser);
    return savedUser;
  }
}