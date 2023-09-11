import { Controller,UseGuards,Req, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe } from '@nestjs/common';
import { friend } from './friend.entity';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { friendService } from './friend.service';
import { CreateFriendDto } from './dtos/friend.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { getUserIDFromToken } from 'src/db_interactions_modules/users/getUserIDFromToken';
import { User } from 'src/db_interactions_modules/users/user.entity';
import { UnblockUserDto } from './dtos/user_to_unblock.dto';
import { BlockUserDto } from './dtos/user_to_block.dto';
import check_valid_number from 'src/db_interactions_modules/app/tools/tools';


@UseGuards(JwtAuthGuard)
@Controller('friends')
export class friendsController {
  constructor(
    private readonly friendService: friendService,
    private jwtService: JwtService
    ) {}

  @Post('/block-user')
  blockuser(@Body() params: BlockUserDto, @getUserIDFromToken() user:User, @Res() res) {
    return this.friendService.blockuser(params.user_to_block, user.id, res);
  }

  @Post('/unblock-user')
  async unblockuser(@Body() params: UnblockUserDto, @getUserIDFromToken() user:User, @Res() res) {
    let deleted_friends = await this.friendService.delete_friend(params.user_to_unblock, user.id)
    if (!deleted_friends)
      return res.status(400).json({ message: 'Invalid User to unblock' });
    return res.status(200).json(deleted_friends)
  }

  @Get()
  findOne(@getUserIDFromToken() user:User) {
    return this.friendService.findByUserId(user.id);
  }

  @Get('/blocked')
  get_blocked(@getUserIDFromToken() user:User) {
    return this.friendService.get_blockedusers(user.id);
  }
  
  @Delete('/deletefriends/:id1/:id2')
  remove(@Param('id1', ParseIntPipe) id1: number,@Param('id2', ParseIntPipe) id2: number,@getUserIDFromToken() user:User) {
    if(check_valid_number(id1) && check_valid_number(id2) && (id1 == user.id || id2 == user.id))
      return this.friendService.delete_friend(id1,id2);
  }

}
