import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameHistoryModule } from '../game_history/game_history.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameHistory } from '../game_history/game_history.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    GameHistoryModule,
    TypeOrmModule.forFeature([GameHistory, User])
  ],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule { }
