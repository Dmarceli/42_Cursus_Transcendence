import { Controller, Param, Get, Post, Query, Req, Res, UseGuards, Body } from '@nestjs/common';
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
import { GoogleAuthGuard } from './google/auth_google.guard';
import { TwoFACodeCheck } from './2FA/2FA-CodeCheck-Dto';
import { Repository} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UsersService,
    private TwoFactorAuthService: TwoFactorAuthService,
    private jwtService: JwtService,
    @InjectRepository(User) private UserRepository: Repository<User> ,
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
  async callbackIntra(@Req() req: { user: User }, @Res() res: any) {
    const payload = await this.authService.login(req.user);
    if (payload.TwoFAEnabled && payload.TwoFASecret) {
      const payload2FA = {
        login: payload.user.intra_nick,
        id: -1,
        TwoFAEnabled: true
      };
      let access_token2FA = this.jwtService.sign(payload2FA, { privateKey: "WRONG2FA", expiresIn: '5m' })
      res.cookie('token', "2FA" + access_token2FA, { secure: false, domain: process.env.HOST_IP })
    }
    else {
      const user_= await this.UserRepository.findOne({where: {id: req.user.id }})
      user_.last_joined_date= new Date();
      await this.UserRepository.save(user_)
      res.cookie('token', payload.access_token, { secure: false, domain: process.env.HOST_IP })
      res.setHeader('Access-Control-Allow-Origin', process.env.BACKEND_URL)
      res.setHeader('Location', process.env.BACKEND_URL)
    }
    res.redirect(process.env.FRONTEND_URL)
  }

  /*******************************************/
  /***            Login Google             ***/
  /*******************************************/

  // @Get('/login_google')
  // @UseGuards(GoogleAuthGuard)
  // async googleAuth(@Req() req) { }

  // @Get('/callback_google')
  // @UseGuards(GoogleAuthGuard)
  // async googleAuthRedirect(@Req() req: { user: User }, @Res() res: any) {
  //   const payload = this.authService.googleLogin(req.user)
  //   if (payload.TwoFAEnabled && payload.TwoFASecret) {
  //     const payload2FA = {
  //       login: payload.user.intra_nick,
  //       id: -1,
  //       TwoFAEnabled: true
  //     };
  //     let access_token2FA = this.jwtService.sign(payload2FA, { privateKey: "WRONG2FA", expiresIn: '5m' })
  //     res.cookie('token', "2FA" + access_token2FA, { secure: false, domain: process.env.HOST_IP })
  //   }
  //   else {
  //     const user_= await this.UserRepository.findOne({where: {id: req.user.id }})
  //     user_.last_joined_date= new Date();
  //     await this.UserRepository.save(user_)
  //     res.cookie('token', payload.access_token,  { secure: false, domain: process.env.HOST_IP })
  //     res.setHeader('Access-Control-Allow-Origin', process.env.BACKEND_URL)
  //     res.setHeader('Location', process.env.BACKEND_URL)

  //   }
  //   res.redirect(process.env.FRONTEND_URL)
  // }

  @Post('/check2fa')
  async check2FAcode(@Body() body: TwoFACodeCheck, @Res() res: any) {
    const user_ = await this.userService.findByLogin(body.id)
    let verified = await this.TwoFactorAuthService.verifyTwoFaCode(body.code, user_)
    if (verified && user_) {
      const payload = await this.authService.login(user_)
      user_.last_joined_date= new Date();
      await this.UserRepository.save(user_)
      res.cookie('token', payload.access_token,  { secure: false, domain: process.env.HOST_IP })
      res.status(200).json({ message: 'Verification successful', code: payload.access_token });
    } else {
      res.status(401).json({ message: 'Invalid verification code' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/gen2fa')
  async gen2FAcode(@Res() res: any, @getUserIDFromToken() user: User) {
    const user_ = await this.userService.findByLogin(user['user']['intra_nick'])
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


  @UseGuards(JwtAuthGuard)
  @Get('/remove2fa')
  async remove2facode(@Res() res: any, @getUserIDFromToken() user: User) {
    const user_ = await this.userService.findByLogin(user['user']['intra_nick'])
    await this.TwoFactorAuthService.remove2fa(user_)
  }


  @UseGuards(JwtAuthGuard)
  @Get('/updateToken')
  async updateToken(@Res() res: any, @getUserIDFromToken() user: User) {
    try {
      const user_ = await this.userService.findById(user['id']);
      if (!user_) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.cookie('token', '', { expires: new Date(0), secure: false, domain: process.env.HOST_IP  });
      const newToken = await this.authService.login(user_);
      res.cookie('token', newToken.access_token,  { secure: false, domain: process.env.HOST_IP });
      return res.status(200).json({ message: 'Token updated successfully', newToken: newToken.access_token });
    } catch (error) {
      return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
  }

}