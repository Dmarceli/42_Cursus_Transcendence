import { Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { AuthService } from './auth.service';
import { FortyTwoAuthGuard } from './auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { query } from 'express';



@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UsersService,
  ) {}

  /*******************************************/
  /***            Login / Logout           ***/
  /*******************************************/

  @Get('/login')
  // @UseGuards(FortyTwoAuthGuard)
  login(@Res() res: any) {
    console.log(process.env.INTRA_CLIENT_ID);
    // console.log("ola")
    // res.send(200, "ola")
    res.redirect('callback_intra');
  }
  
  
  @UseGuards(FortyTwoAuthGuard)
  @Get('/callback_intra')
  async callbackIntra(@Req() req: any) {
    console.log("cheguei aqui")
    console.log('Request User:');
    console.log(req.user);
    const payload = await this.authService.login(req.user);
    return payload;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any, @Res() res: any) {
    console.log('\nlogout');
    console.log(req.user);

    const userName = req.user.username;

    return req.logOut(() => {
      res.json({
        user: userName,
        message: 'User has been logged out!',
      });
    });
  }
}