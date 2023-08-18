import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res } from '@nestjs/common';
import { UserToChannelService } from './user_to_channel.service';
import { CreateUserToChannDto } from './dtos/user_to_channel.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { getUserIDFromToken } from 'src/db_interactions_modules/users/getUserIDFromToken';
import { User } from 'src/db_interactions_modules/users/user.entity';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { ChannelsService } from 'src/db_interactions_modules/channels/channels.service';


@UseGuards(JwtAuthGuard)
@Controller('usertochannel')
export class UserToChannelController {
  constructor(
      private readonly userToChannelService: UserToChannelService,
      private channelService: ChannelsService,
      private userService: UsersService,
    ) {}
  
 @Post('/joinchannel')
  async create(@Body() channelID: any, @getUserIDFromToken() user:User, @Res() res: any) {
    const channel = await this.channelService.getChannelByID(channelID.id)
    if (!channel || !channelID.id || !channelID ){
      return res.status(202).json({ message: 'Channel Doesnt exist' });
    }
    const user_ = await this.userService.findByLogin(user['login'])
    this.userToChannelService.joinchannel(channel, user, channelID.pass);
    return res.status(200).json({message : 'Joined Channel'}) 
  }
  

  @Post('/leavechannel')
  async leave(@Body() channelID: any, @getUserIDFromToken() user: User, @Res() res: any) {
    const user_ = await this.userService.findByLogin(user['user']['intra_nick']);
    this.userToChannelService.leavechannel(user_.id, channelID.id);
    return res.status(200).json({ message: 'Left channel' });
  }
  

  @Get('/joinedchannels')
  async getJoinedChannels(@getUserIDFromToken() user: User, @Res() res: any) {
    const userChannels = await this.userToChannelService.findChannelsByID(user.id);
    return res.status(200).json(userChannels);
  }

  @Get('/usersinchannel/:channelId')
  async getUsersInChannel(@Param('channelId') channelId: string , @getUserIDFromToken() user:User, @Res() res: any) {
    if(channelId){
    const users = await this.userToChannelService.usersonchannel(+channelId,user.id);
    return res.status(200).json(users);
    }
    return res.status(200);
  }
  
  @Get('/getusersonchannel/:id')
  findAll(@Param('id') ch_id: string,  @getUserIDFromToken() user:User) {
    if(ch_id)
      return this.userToChannelService.usersonchannel(+ch_id,user.id);
    else
      return
  }

  @Get('/getChannelsByUserID/:id')
  findChannelsByUserID(@Param('id') us_id: number){
    return this.userToChannelService.findChannelsByID(us_id);
  }

  @Post('/kick/:userid/from/:channelid')
  kick_user_from_channel(@Param('userid') us_id: number,@Param('channelid') ch_id: number, @getUserIDFromToken() user:User, @Res() res: any){
    return this.userToChannelService.kick_from_channel(us_id,ch_id,user.id,res );
  }
  
  @Post('/ban/:userid/from/:channelid')
  ban_user_from_channel(@Param('userid') us_id: number,@Param('channelid') ch_id: number, @getUserIDFromToken() user:User, @Res() res: any){
    return this.userToChannelService.ban_from_channel(us_id,ch_id,user.id,res );
  }
  
  @Post('/mute/:userid/from/:channelid')
  mute_user_from_channel(@Param('userid') us_id: number,@Param('channelid') ch_id: number, @getUserIDFromToken() user:User, @Res() res: any){
    return this.userToChannelService.mute_from_channel(us_id,ch_id,user.id,res );
  }
  @Post('/giveadmin/:userid/on/:channelid/:action')
  //{{SERVER_IP}}:3000/usertochannel/giveadmin/1/on/1/take - remove
  //{{SERVER_IP}}:3000/usertochannel/giveadmin/1/on/1/give - dá admin
  give_admin_to_user(@Param('userid') us_id: number,@Param('channelid') ch_id: number,@Param('action') action: string, @getUserIDFromToken() user:User, @Res() res: any){
    return this.userToChannelService.give_admin_to_user(us_id,ch_id,user.id,res,action );
  }
  
  @Post('privatemessage/:userid')
  start_private_message(@Param('userid') us_id: number, @getUserIDFromToken() user:User){
    return this.userToChannelService.privatemessage_channel(us_id,user.id);
  }

}
