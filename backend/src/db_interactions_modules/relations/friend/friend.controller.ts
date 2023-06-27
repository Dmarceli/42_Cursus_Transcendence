import { Controller,UseGuards,Req, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { friend } from './friend.entity';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { friendService } from './friend.service';
import { CreateFriendDto } from './dtos/friend.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { getUserIDFromToken } from 'src/db_interactions_modules/users/getUserIDFromToken';


@UseGuards(JwtAuthGuard)
@Controller('friends')
export class friendsController {
  constructor(
    private readonly friendService: friendService,
    private jwtService: JwtService
    ) {}
  
 @Post('/create')
  create(@Body() createFriendDto: CreateFriendDto) {
    return this.friendService.createfriend(createFriendDto);
  }

  @Get('/getfriends')
  findAll() {
    return this.friendService.findAll();
  }

  @Get()
  findOne(@Req() req:any, @getUserIDFromToken() user:any) {
    return this.friendService.findByUserId(user.id);

  }
  
    @Delete('/deletefriends/:id1/:id2')
    remove(@Param('id1') id1: number,@Param('id2') id2: number ) {
      return this.friendService.delete_friend(id1,id2);
    }

}
