import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GameHistoryService } from './game_history.service';
import { CreateGameHistoryDto } from './dtos/createGameHistory.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import check_valid_number from '../app/tools/tools';
@UseGuards(JwtAuthGuard)
@Controller('game-history')
export class GameHistoryController {
  constructor(private readonly gameHistoryService: GameHistoryService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    if(check_valid_number(+id))
      return this.gameHistoryService.get_history(id);
  }
}
