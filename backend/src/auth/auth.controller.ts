import { Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { AuthService } from './auth.service';
import { FortyTwoAuthGuard } from './42/auth.guard';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { query } from 'express';
import { TwoFactorAuthService } from './2FA/2FA-service';
import { JwtService } from '@nestjs/jwt';
import { getUserIDFromToken } from 'src/db_interactions_modules/users/getUserIDFromToken';
import { User } from 'src/db_interactions_modules/users/user.entity';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UsersService,
    private TwoFactorAuthService: TwoFactorAuthService,
    private jwtService: JwtService
  ) {
  }
  /*******************************************/
  /***            Login 42                ***/
  /*******************************************/

  @Get('/login')
  login(@Res() res: any) {
    res.redirect('callback_intra');
  }

  @UseGuards(FortyTwoAuthGuard)
  @Get('/callback_intra')
  async callbackIntra(@Req() req: any, @Res() res: any) {
    const payload = await this.authService.login(req.user);
    if (payload.user.TwoFAEnabled && payload.user.TwoFASecret) {
      const payload2FA = {
        login: payload.user.intra_nick,
        id: -1,
        TwoFAEnabled: true
      };
      let access_token2FA = this.jwtService.sign(payload2FA, { privateKey: "WRONG2FA", expiresIn: '5m' })
      res.cookie('token', "2FA" + access_token2FA)
    }
    else {
      res.cookie('token', payload.access_token)
    }    
    res.redirect(process.env.FRONTEND_URL)
  }

  /*******************************************/
  /***            Login Google             ***/
  /*******************************************/

  @Get('/login_google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) { }

  @Get('/callback_google')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const payload = this.authService.googleLogin(req)
    if (payload.user.TwoFAEnabled && payload.user.TwoFASecret) {
      const payload2FA = {
        login: payload.user.intra_nick,
        id: -1,
        TwoFAEnabled: true
      };
      let access_token2FA = this.jwtService.sign(payload2FA, { privateKey: "WRONG2FA", expiresIn: '5m' })
      res.cookie('token', "2FA" + access_token2FA)
    }
    else {
      res.cookie('token', payload.access_token)
      res.setHeader('Access-Control-Allow-Origin:', process.env.BACKEND_URL)
    }

    res.redirect(process.env.FRONTEND_URL)
  }

  @Post('/check2fa')
  async check2FAcode(@Req() req: any, @Res() res: any) {
    const user_ = await this.userService.findByLogin(req.body.id.login)
    console.log(req.body.id.login)
    let  verified = await this.TwoFactorAuthService.verifyTwoFaCode(req.body.code, user_)

    if (verified && user_) {
      const payload = await this.authService.login(user_)
      res.cookie('token', payload.access_token)
      res.status(200).json({ message: 'Verification successful', code: payload.access_token });
    } else {
      res.status(401).json({ message: 'Invalid verification code' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/gen2fa')
  async gen2FAcode(@Res() res: any, @getUserIDFromToken() user:User) {
    const user_ = await this.userService.findByLogin(user['login'])
    const url_ = await this.TwoFactorAuthService.generateTwoFactorAuthSecret(user_)
    const qrCode = require('qrcode')
    const qrCodeData = url_.otpAuthUrl;
    try {
      const qrCodeImage = await qrCode.toBuffer(qrCodeData, {
        type: 'png',
      })
      res.setHeader('Content-Type', 'image/png');
      res.send(qrCodeImage);
    } catch (error) {
      res.status(500).send('Error generating QR code');
    }

  }
  

  // TEMPORARY
  @Get('/tempbypass')
  async tempsecbypass(@Req() req: any, @Res() res: any) {
    const user_ = await this.userService.findAll()
    if (user_) {
      const payload = await this.authService.login(user_[0])
      res.cookie('token', payload.access_token)
      res.status(200).json({ message: 'Verification successful', code: payload.access_token });
    } else {
      res.status(401).json({ message: 'Invalid verification code' });
    }
  }
  // @UseGuards(JwtAuthGuard)
  // @Post('logout')
  // async logout(@Req() req: any, @Res() res: any) {
  //   console.log('\nlogout');
  //   const userName = req.user.username;

  //   return req.logOut(() => {
  //     res.json({
  //       user: userName,
  //       message: 'User has been logged out!',
  //     });
  //   });

  // }
}