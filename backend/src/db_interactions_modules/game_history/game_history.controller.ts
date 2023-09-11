import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GameHistoryService } from './game_history.service';
import { CreateGameHistoryDto } from './dtos/createGameHistory.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { ParseIdPipe } from 'src/db_interactions_modules/pipes/parse_id.pipe'

@UseGuards(JwtAuthGuard)
@Controller('game-history')
export class GameHistoryController {
	constructor(private readonly gameHistoryService: GameHistoryService) { }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gameHistoryService.get_history(id);
  }
}
