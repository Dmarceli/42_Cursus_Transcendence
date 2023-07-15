import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameHistoryModule } from '../game_history/game_history.module';

@Module({
  imports: [
    GameHistoryModule
  ],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule { }
