import { Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { AuthService } from './auth.service';
import { FortyTwoAuthGuard } from './42/auth.guard';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { query } from 'express';
import { TwoFactorAuthService } from './2FA/2FA-service';


@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UsersService,
    private TwoFactorAuthService: TwoFactorAuthService
  ) { }

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
  async googleAuth(@Req() req) {}

  @Get('/callback_google')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req:any, @Res() res: any) {
    const payload = this.authService.googleLogin(req)
    if (payload.user.TwoFAEnabled)
    {
      res.cookie('token', "2FA" + payload.user.intra_nick,)
    }
    else
    {
      res.cookie('token', payload.access_token,)
    }
    
    res.redirect('http://localhost:5173/')
  }

  @Get('/2fa')
  async twofactorauth( @Res() res: any){
    const qrCode = require('qrcode')
    const qrCodeData = 'https://www.google.com'; 
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

  @Post('/check2fa')
  async check2FAcode(@Req() req:any, @Res() res: any){
    console.log(req.body)
    // console.log(req.body.code)
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