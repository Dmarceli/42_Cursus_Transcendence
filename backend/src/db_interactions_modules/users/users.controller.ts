import { Controller, UseGuards, Get, Post, Body, Patch, Param, Delete, Res, Req, UploadedFile, UseInterceptors, HttpStatus, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/user.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { getUserIDFromToken } from 'src/db_interactions_modules/users/getUserIDFromToken';
import { User } from './user.entity';
import { existsSync } from 'fs';
import { join } from 'path';
import { UserProfileSettingsDto as NickStringDto } from './dtos/user-profile.dto';
import * as sanitizeHtml from 'sanitize-html';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/profile/')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async uploadFile(@UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 5242880 }),
      new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)/ }),
    ],
    fileIsRequired: false
  })) file: Express.Multer.File, @getUserIDFromToken() user: User, @Body() params : NickStringDto) {
    params.nickUpdate = sanitizeHtml(params.nickUpdate);
    return this.usersService.updateProfile(file, user.id, params.nickUpdate);
  }

  @Get('/avatar/:filename')
  seeUploadedFile(@Param('filename') file, @Res() res) {
    const filePath = join('./uploads', file)
    if (!existsSync(filePath)) {
        return res.sendFile("default.jpg", { root: './uploads' });
    }
    return res.sendFile(file, { root: './uploads' });
  }

  @UseGuards(JwtAuthGuard)
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
      delete login.TwoFASecret;
      return res.status(HttpStatus.OK).json(login);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getUserInfo/')
  getUserInfo(@getUserIDFromToken() user: User) {
    return this.usersService.findById(user['id'])
  }

  @UseGuards(JwtAuthGuard)
  @Get('leaderboard')
  findLeaderboardInfo() {
    return this.usersService.leaderboardInfo();
  }
}

