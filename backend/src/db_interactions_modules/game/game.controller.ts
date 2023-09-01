import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GameService, PrivateGame } from './game.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { getUserIDFromToken } from '../users/getUserIDFromToken';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}
  @Get("private")
  findAll() : PrivateGame[] {
    return this.gameService.getPrivate();
  }
}
