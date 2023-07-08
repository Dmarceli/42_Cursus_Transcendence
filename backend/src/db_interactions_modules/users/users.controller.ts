import { Controller,UseGuards, Get, Post, Body, Patch, Param, Delete, Res, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/user.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/createuser')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }
  
  @Get('/getUsers')
  findAll(@Req() req: any) {
    return this.usersService.findAll();
  }

  @Get('/getUsers/:nick')
  findbyusername(@Param('nick') nick_: string, @Res() res) {
    return this.usersService.findbyusername_(nick_, res);
  }
/* 

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }*/
}
