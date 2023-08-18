import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { getUserIDFromToken } from 'src/db_interactions_modules/users/getUserIDFromToken';
import { User } from 'src/db_interactions_modules/users/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class MessagesController {
  constructor(private readonly MessagesService: MessagesService) {}

  @Get('/msg_in_channel/:id')
  findAll(@Param('id') id: number,@getUserIDFromToken() user:User) {
    return this.MessagesService.findMessagesByChannelId(id,user);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.ChatService.findOne(+id);
  // }  

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
  //   return this.ChatService.update(+id, updateChannelDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.ChatService.remove(+id);
  // }
}
