import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GameService, PrivateGame } from './game.service';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get("private")
  findAll() : PrivateGame[] {
    console.log("GOT HERE")
    return this.gameService.getPrivate();
  }

}
