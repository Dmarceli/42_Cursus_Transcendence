import { AuthService } from "../auth.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from 'src/db_interactions_modules/users/user.entity';
import { authenticator } from "otplib";
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import {UsersService} from 'src/db_interactions_modules/users/users.service';
import { Module } from '@nestjs/common';
import { Repository, QueryFailedError } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { toDataURL } from 'qrcode';

@Injectable()
export class TwoFactorAuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private userService: UsersService,
    ) {}

    public async generateTwoFactorAuthSecret(user: User) {
        const auth = await this.userService.findByLogin(user.intra_nick);

        const secret = authenticator.generateSecret();
        const app_name = 'Raquetas';
        const otpAuthUrl = authenticator.keyuri(user.intra_nick, app_name, secret);

        const Cryptr = require('cryptr');
        const cryptr = new Cryptr(`${process.env.JWT_SECRET_KEY}`);
        const encryptedString = cryptr.encrypt(secret);
        //const decryptedString = cryptr.decrypt(encryptedString);
        //console.log("encripted",encryptedString)
        //console.log("decrypted",decryptedString)
        await this.userRepository.update({ intra_nick: user.intra_nick }, { TwoFASecret: encryptedString, TwoFAEnabled: true });
        return {
            secret,
            otpAuthUrl
        }
    }

    public async remove2fa(user: User) {
      const auth = await this.userService.findByLogin(user.intra_nick);
      await this.userRepository.update({ intra_nick: user.intra_nick }, { TwoFASecret: null, TwoFAEnabled: false });
      return 
  }
    

    public async GenerateqrCode(otpUrl: string) {
        return toDataURL(HTMLCanvasElement, otpUrl)
    }

    public async activationOfTwoFa(email: string, status: boolean) {
        return await this.userRepository.update({ intra_nick: email }, {
            TwoFAEnabled: status
        });
    }

    public async verifyTwoFaCode(code: string, user: User) {
        if(user){
        const Cryptr = require('cryptr');
        const cryptr = new Cryptr(`${process.env.JWT_SECRET_KEY}`);
        const decryptedString = cryptr.decrypt(user.TwoFASecret);
        return authenticator.verify({
            token: code,
            secret: decryptedString
        });
        }
        else{
            return false;
        }
    }

    async signIn(user: User, isTwoFaAuthenticated: boolean) {
        const data = {
            TwoFAEnabled: user.TwoFAEnabled,
            intra_nick: user.intra_nick,
        }
        // const accessToken = await this.authService.getAccessToken(data);
        // const refreshToken = await this.authService.getRefreshToken(data);
        // await this.authService.updateRefreshTokenInUser(refreshToken, user.intra_nick);

        return {
            //accessToken,
            //refreshToken,
            user//: {
               // intra_nick: user.intra_nick,
                //user_info: user.user_info
            //}
        };
    }
} 



