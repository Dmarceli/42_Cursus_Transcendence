import { Module } from '@nestjs/common';
import { GameHistoryService } from './game_history.service';
import { GameHistoryController } from './game_history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameHistory } from './game_history.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameHistory, User])
],
  controllers: [GameHistoryController],
  providers: [GameHistoryService],
  exports: [GameHistoryService]
})
export class GameHistoryModule {}
