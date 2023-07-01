import { Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { AuthService } from './auth.service';
import { FortyTwoAuthGuard } from './42/auth.guard';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { query } from 'express';
import { TwoFactorAuthService } from './2FA/2FA-service';
import { JwtService } from '@nestjs/jwt';

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
    res.cookie('token', payload.access_token,)
    res.redirect('http://localhost:5173/')
    // return payload;
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
      };
      let access_token2FA = this.jwtService.sign(payload2FA, { privateKey: `${process.env.JWT_SECRET_KEY}`, expiresIn: '5m' })
      res.cookie('token', "2FA" + access_token2FA)
    }
    else {
      res.cookie('token', payload.access_token)
    }

    res.redirect('http://localhost:5173/')
  }

  @Post('/check2fa')
  async check2FAcode(@Req() req: any, @Res() res: any) {
    const user_ = await this.userService.findByLogin(req.body.id)
    let verified = this.TwoFactorAuthService.verifyTwoFaCode(req.body.code, user_)
    if (verified) {
      res.status(200).json({ message: 'Verification successful' });
    } else {
      res.status(401).json({ message: 'Invalid verification code' });
    }

  }


  @Get('/gen2fa')
  async gen2FAcode(@Res() res: any) {
    const user_ = await this.userService.findByNick("Daniel")
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