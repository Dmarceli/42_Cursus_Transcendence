import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GameHistoryService } from './game_history.service';

@Controller('game-history')
export class GameHistoryController {
  constructor(private readonly gameHistoryService: GameHistoryService) {}

 /* @Post()
  create(@Body() createGameHistoryDto: CreateGameHistoryDto) {
    return this.gameHistoryService.create(createGameHistoryDto);
  }

  @Get()
  findAll() {
    return this.gameHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameHistoryDto: UpdateGameHistoryDto) {
    return this.gameHistoryService.update(+id, updateGameHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gameHistoryService.remove(+id);
  }*/
}
