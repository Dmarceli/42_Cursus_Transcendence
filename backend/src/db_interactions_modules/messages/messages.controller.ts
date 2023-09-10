import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { getUserIDFromToken } from 'src/db_interactions_modules/users/getUserIDFromToken';
import { User } from 'src/db_interactions_modules/users/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class MessagesController {
  constructor(private readonly MessagesService: MessagesService) {}

  @Get('/msg_in_channel/:id')
  findAll(@Param('id', ParseIntPipe) id: number,@getUserIDFromToken() user:User)
  {
    return this.MessagesService.findMessagesByChannelId(id,user);
  }
}
