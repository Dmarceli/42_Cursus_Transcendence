import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';
import { CreateUserDto } from 'src/db_interactions_modules/users/dtos/user.dto';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { uid } from 'uid';

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

  constructor(private userService: UsersService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
      scope: ['email', 'profile'],
    });
  }

  async validate (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { name, emails, photos } = profile
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken
    }

    let userintranick = profile.emails[0].value.split("@")[0];
    const userFound = await this.userService.findByLogin(userintranick);
    if (userFound) {
      return userFound;
    }
    
    const files= require("fs");
    let randomStringGenerator =  uid(21); 
    const downloaded_img = await fetch(user.picture)
    if(downloaded_img.ok){
    const file_to_save= await downloaded_img.blob()
    const blob = Buffer.from(await file_to_save.arrayBuffer())
    await files.writeFileSync( "./uploads/" + randomStringGenerator+ ".jpg", blob);
    }
    else
      randomStringGenerator = "default" //If download fails must be jpg
    

    const foundUserNick = await this.userService.findByNick(user.firstName)
    const newNick = foundUserNick ? user.firstName + randomInt(999) : user.firstName;
    const newUser: CreateUserDto = {
      nick: newNick,
      intra_nick: user.email.split('@')[0],
      avatar:  process.env.BACKEND_URL + '/users/avatar/' + randomStringGenerator + '.jpg',
      // first_name: profile._json.first_name,
      // last_name: profile._json.last_name,
      // twoFactorAuthenticationSecret: '',
      // isTwoFactorAuthenticationEnabled: false,
    };
    const savedUser = this.userService.createUser(newUser);
      
    return savedUser;
  }
}