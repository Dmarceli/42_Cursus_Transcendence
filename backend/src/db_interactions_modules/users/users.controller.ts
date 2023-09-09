import { Controller,UseGuards, Get, Post, Body, Patch, Param, Delete, Res, Req, UploadedFile, UseInterceptors, HttpStatus, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/user.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { getUserIDFromToken } from 'src/db_interactions_modules/users/getUserIDFromToken';
import { User } from './user.entity';
import { existsSync } from 'fs';
import { join } from 'path';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/createuser')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

	@Post('/profile/')
		@UseInterceptors(FileInterceptor('file', { dest: './uploads'}))
		async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('userId') userId: number,  @Body('nickUpdate') nickUpdate: string) {
      return this.usersService.updateProfile(file, userId, nickUpdate);
	}

  @Get('/avatar/:filename')
  seeUploadedFile(@Param('filename') file, @Res() res) {
    try {
      const filePath = join('./uploads', file)
      if (!existsSync(filePath)) {
          throw new NotFoundException(`Could not find requested file ${file}`)
      }
    }
    catch(err)
    {
      return res.status(err.status).send(err.message)
    }
    return res.sendFile(file, { root: './uploads' });
  }

  @Get('/getUsers')
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getUsers/:intra_nick')
  async findbyLogin(@Param('intra_nick') intra_nick: string, @Res() res) {
    let login =  await this.usersService.findByLogin(intra_nick);
    if (!login) {
      return res.status(HttpStatus.NOT_FOUND).json();
    }
    else
    {
      return res.status(HttpStatus.OK).json(login);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getUserInfo/')
  getUserInfo(@getUserIDFromToken() user: User) {
    return this.usersService.findById(user['id'])
  }

  @Get('leaderboard')
  findLeaderboardInfo() {
    return this.usersService.leaderboardInfo();
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
