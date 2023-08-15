import { Controller, Get, Res } from '@nestjs/common';
import { AppService, UserStatus } from './app.service';

@Controller()
export class AppController {
 constructor(private readonly appService: AppService) {}
 
  @Get('/api/chat')
  async Chat(@Res() res) {
   const messages = await this.appService.getMessages();
   res.json(messages);
  }

  @Get('/online-status/')
  OnlineStatus() : Promise<UserStatus[]>{
   return this.appService.get_online_status_users()
  }

}