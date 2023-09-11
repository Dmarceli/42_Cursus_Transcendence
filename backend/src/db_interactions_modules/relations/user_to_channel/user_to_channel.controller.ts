import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, ParseIntPipe } from '@nestjs/common';
import { UserToChannelService } from './user_to_channel.service';
import { CreateUserToChannDto, InviteUserToChannDto } from './dtos/user_to_channel.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { getUserIDFromToken } from 'src/db_interactions_modules/users/getUserIDFromToken';
import { User } from 'src/db_interactions_modules/users/user.entity';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { ChannelsService } from 'src/db_interactions_modules/channels/channels.service';
import { EventCreateDto } from 'src/db_interactions_modules/events/dtos/events.dto';
import check_valid_number from 'src/db_interactions_modules/app/tools/tools';


@UseGuards(JwtAuthGuard)
@Controller('usertochannel')
export class UserToChannelController {
  constructor(
      private readonly userToChannelService: UserToChannelService,
      private channelService: ChannelsService,
      private userService: UsersService,
    ) {}
  
 @Post('/joinchannel')
  async create(@Body() channelID: CreateUserToChannDto, @getUserIDFromToken() user:User, @Res() res: any) {
    const channel = await this.channelService.getChannelByID(channelID.id)
    if (!channel || !channelID.id || !channelID ){
      return res.status(202).json({ message: 'Channel Doesnt exist' });
    }
    const user_ = await this.userService.findByLogin(user['login'])
    this.userToChannelService.joinchannel(channel, user, channelID.pass);
    return res.status(200).json({message : 'Joined Channel'}) 
  }

  @Post('/invite_to_channel')
  async invited_to_channel(@Body() bodyinfo: InviteUserToChannDto, @getUserIDFromToken() user:User, @Res() res: any) {
    // const channel = await this.channelService.getChannelByID(channelID.id)
    // if (!channel || !channelID.id || !channelID ){
    //   return res.status(202).json({ message: 'Channel Doesnt exist' });
    // }
    // const user_ = await this.userService.findByLogin(user['login'])
    // this.userToChannelService.joinchannel(channel, user, channelID.pass);
    await this.userToChannelService.invite_to_channel(bodyinfo)
    return res.status(200).json({message : 'Joined Channel'}) 
  }
  

  @Post('/leavechannel')
  async leave(@Body() channelID: CreateUserToChannDto, @getUserIDFromToken() user: User, @Res() res: any) {
    const user_ = await this.userService.findByLogin(user['user']['intra_nick']);
    this.userToChannelService.leavechannel(user_.id, channelID.id);
    return res.status(200).json({ message: 'Left channel' });
  }

  @Post('/deletechannel')
  async delete_channel(@Body() channelID: CreateUserToChannDto, @getUserIDFromToken() user: User, @Res() res: any) {
    if(!channelID)
      return res.status(403).json({ message: 'Bad Format'});
    const user_ = await this.userService.findByLogin(user['user']['intra_nick']);
    return this.userToChannelService.deletechannel(user_.id, channelID.id, res);
  }
  

  @Get('/joinedchannels')
  async getJoinedChannels(@getUserIDFromToken() user: User, @Res() res: any) {
    const userChannels = await this.userToChannelService.findChannelsByID(user.id);
    return res.status(200).json(userChannels);
  }

  @Get('/usersinchannel/:channelId')
  async getUsersInChannel(@Param('channelId', ParseIntPipe) channelId: number , @getUserIDFromToken() user:User, @Res() res: any) {
    if(channelId && check_valid_number(channelId)){
    const users = await this.userToChannelService.usersonchannel(+channelId,-1);
    return res.status(200).json(users);
    }
    return res.status(200).json("");
  }
  
  @Get('/bannedusersinchannel/:channelId')
  async getbannedUsersInChannel(@Param('channelId', ParseIntPipe) channelId: number , @getUserIDFromToken() user:User, @Res() res: any) {

    if(channelId && check_valid_number(channelId)){
    const users = await this.userToChannelService.bannedusersonchannel(+channelId,user.id);
    return res.status(200).json(users);
    }
    return res.status(200).json("");
  }

  @Get('/getusersonchannel/:id')
  findAll(@Param('id', ParseIntPipe) ch_id: number,  @getUserIDFromToken() user:User) {
    if(ch_id)
      return this.userToChannelService.usersonchannel(+ch_id,user.id);
    else
      return
  }

  @Get('/getChannelsByUserID/:id')
  findChannelsByUserID(@Param('id', ParseIntPipe) us_id: number){
    if(check_valid_number(us_id))
      return this.userToChannelService.findChannelsByID(us_id);
  }

  @Post('/kick/:userid/from/:channelid')
  kick_user_from_channel(@Param('userid', ParseIntPipe) us_id: number,@Param('channelid', ParseIntPipe) ch_id: number, @getUserIDFromToken() user:User, @Res() res: any){
    if(check_valid_number(us_id) && check_valid_number(ch_id))
      return this.userToChannelService.kick_from_channel(us_id,ch_id,user.id,res );
    return res.status(400).json("Invalid User / Channel")
  }
  
  @Post('/ban/:userid/from/:channelid')
  ban_user_from_channel(@Param('userid', ParseIntPipe) us_id: number,@Param('channelid', ParseIntPipe) ch_id: number, @getUserIDFromToken() user:User, @Res() res: any){
    if(check_valid_number(us_id) && check_valid_number(ch_id))
      return this.userToChannelService.ban_from_channel(us_id,ch_id,user.id,res );
    return res.status(400).json("Invalid User / Channel")
  }

  @Post('/unban/:userid/from/:channelid')
  unban_user_from_channel(@Param('userid', ParseIntPipe) us_id: number,@Param('channelid', ParseIntPipe) ch_id: number, @getUserIDFromToken() user:User, @Res() res: any){
    if(check_valid_number(us_id) && check_valid_number(ch_id))
      return this.userToChannelService.unban_from_channel(us_id,ch_id,user.id,res );
    return res.status(400).json("Invalid User / Channel")
  }

  @Post('/mute/:userid/from/:channelid')
  mute_user_from_channel(@Param('userid', ParseIntPipe) us_id: number,@Param('channelid', ParseIntPipe) ch_id: number, @getUserIDFromToken() user:User, @Res() res: any){
    if(check_valid_number(us_id) && check_valid_number(ch_id))
      return this.userToChannelService.mute_from_channel(us_id,ch_id,user.id,res );
    return res.status(400).json("Invalid User / Channel")
  }
  @Post('/giveadmin/:userid/on/:channelid/:action')
  //{{SERVER_IP}}:3000/usertochannel/giveadmin/1/on/1/take - remove
  //{{SERVER_IP}}:3000/usertochannel/giveadmin/1/on/1/give - dá admin
  give_admin_to_user(@Param('userid', ParseIntPipe) us_id: number,@Param('channelid', ParseIntPipe) ch_id: number,@Param('action') action: string, @getUserIDFromToken() user:User, @Res() res: any){
    return this.userToChannelService.give_admin_to_user(us_id,ch_id,user.id,res,action );
  }
  
  @Post('/giveownership/:userid/on/:channelid')
  give_ownership_to_user(@Param('userid', ParseIntPipe) us_id: number,@Param('channelid', ParseIntPipe) ch_id: number, @getUserIDFromToken() user:User, @Res() res: any){
    return this.userToChannelService.give_ownership_to_user(us_id,ch_id,user.id,res);
  }
  

  @Post('privatemessage/:userid')
  start_private_message(@Param('userid', ParseIntPipe) us_id: number, @getUserIDFromToken() user:User){
    return this.userToChannelService.privatemessage_channel(us_id,user.id);
  }

}
