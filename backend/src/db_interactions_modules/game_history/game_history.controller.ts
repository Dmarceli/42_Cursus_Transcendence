import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GameHistoryService } from './game_history.service';
import { CreateGameHistoryDto } from './dtos/createGameHistory.dto';
@Controller('game-history')
export class GameHistoryController {
  constructor(private readonly gameHistoryService: GameHistoryService) {}

  //To trigger test creation
  // @Post()
  // create(@Body() createGameHistoryDto: CreateGameHistoryDto) {
  //   return this.gameHistoryService.create(createGameHistoryDto);
  // }

  @Get('all')
  findAll() {
    return this.gameHistoryService.all_history();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameHistoryService.all_history();
  }

}
