import { Module } from '@nestjs/common';
import { GameHistoryService } from './game_history.service';
import { GameHistoryController } from './game_history.controller';

@Module({
  controllers: [GameHistoryController],
  providers: [GameHistoryService]
})
export class GameHistoryModule {}
