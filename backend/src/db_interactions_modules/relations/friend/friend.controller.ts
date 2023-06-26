import { Controller,UseGuards,Req, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { friend } from './friend.entity';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { friendService } from './friend.service';
import { CreateFriendDto } from './dtos/friend.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
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

  @UseGuards(JwtAuthGuard)
  @Get()
  findOne(@Req() req:any) {
    //console.log("AAA",req.headers.authorization.split("Bearer ")[1])
    const decoded=this.jwtService.decode(req.headers.authorization.split("Bearer ")[1])
    console.log(decoded['id'])
    return this.friendService.findByUserId(decoded['id']);

  }
  
    @Delete('/deletefriends/:id1/:id2')
    remove(@Param('id1') id1: number,@Param('id2') id2: number ) {
      return this.friendService.delete_friend(id1,id2);
    }

}
