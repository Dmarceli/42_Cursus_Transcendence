import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MessagesService } from './messages.service';


@Controller('chat')
export class MessagesController {
  constructor(private readonly MessagesService: MessagesService) {}

  @Get('/msg_in_channel/:id')
  findAll(@Param('id') id: number) {
    return this.MessagesService.findMessagesByChannelId(id);
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
