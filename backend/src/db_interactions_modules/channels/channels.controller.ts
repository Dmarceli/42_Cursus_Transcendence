import { Controller, Get, Post, Body, Patch, Param, Res, Delete , UseGuards} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelCreateDto, ChannelProtectDto } from './dtos/channelcreate.dto';
import { getUserIDFromToken } from 'src/db_interactions_modules/users/getUserIDFromToken';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { User } from '../users/user.entity';
import * as sanitizeHtml from 'sanitize-html';

@UseGuards(JwtAuthGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post('/create')
  create(@Body() createChannelDto: ChannelCreateDto,@getUserIDFromToken() user: User) {
    createChannelDto.channel_name = sanitizeHtml(createChannelDto.channel_name);
    return this.channelsService.create(createChannelDto,user.id);
  }

  @Get('/all')
  findAll(@getUserIDFromToken() user: User) {
    return this.channelsService.all_channel(user.id);
  }

  @Post('/protect')
  protect(@Body() channelinfo: ChannelProtectDto,@getUserIDFromToken() user: User, @Res() res: any) {
    return this.channelsService.protect(channelinfo,user.id, res);
  }
}
