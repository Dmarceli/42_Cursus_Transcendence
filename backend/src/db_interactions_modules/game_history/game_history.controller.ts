import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GameHistoryService } from './game_history.service';
import { CreateGameHistoryDto } from './dtos/createGameHistory.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@Controller('game-history')
export class GameHistoryController {
  constructor(private readonly gameHistoryService: GameHistoryService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameHistoryService.get_history(id);
  }
}
