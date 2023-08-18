import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { UserStatus } from './types/UserStatus';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class AppController {
 constructor(private readonly appService: AppService) {}
 
  @Get('/online-status/')
  OnlineStatus() : Promise<UserStatus[]>{
   return this.appService.get_online_status_users()
  }

}