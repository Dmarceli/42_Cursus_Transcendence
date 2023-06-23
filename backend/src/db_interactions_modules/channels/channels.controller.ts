import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelCreateDto } from './dtos/channelcreate.dto';


@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post('/create')
  create(@Body() createChannelDto: ChannelCreateDto) {
    console.log(createChannelDto)
    return this.channelsService.create(createChannelDto);
  }

  @Get('/all')
  findAll() {
    return this.channelsService.all_channel();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.channelsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
  //   return this.channelsService.update(+id, updateChannelDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.channelsService.remove(+id);
  // }
}
