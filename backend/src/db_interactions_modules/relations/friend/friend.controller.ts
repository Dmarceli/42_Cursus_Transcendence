import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { friend } from './friend.entity';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { friendService } from './friend.service';
import { CreateFriendDto } from './dtos/friend.dto';

@Controller('friends')
export class friendsController {
  constructor(private readonly friendService: friendService) {}
  
 @Post('/create')
  create(@Body() createFriendDto: CreateFriendDto) {
    return this.friendService.createfriend(createFriendDto);
  }

  @Get('/getfriends')
  findAll() {
    return this.friendService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.friendService.findByUserId(+id);
  }
  
    @Delete('/deletefriends/:id1/:id2')
    remove(@Param('id1') id1: number,@Param('id2') id2: number ) {
      return this.friendService.delete_friend(id1,id2);
    }

}
