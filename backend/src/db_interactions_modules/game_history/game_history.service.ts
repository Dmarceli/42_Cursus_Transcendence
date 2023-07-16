import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameHistory } from './game_history.entity';
import { User } from '../users/user.entity';
import { CreateGameHistoryDto } from './dtos/createGameHistory.dto';
@Injectable()
export class GameHistoryService {

  constructor(
    @InjectRepository(GameHistory) private gameHistoryRepository: Repository<GameHistory>
  ,@InjectRepository(User) private userRepository: Repository<User>){}
  
  
  async create(createGameHistoryDto: CreateGameHistoryDto) {
    const winner_user= await this.userRepository.findOne({where: {id: createGameHistoryDto.winnerId}})
    const loser_user= await this.userRepository.findOne({where: {id: createGameHistoryDto.loserId}})
    await this.gameHistoryRepository.save({
      time_end: new Date(),
      time_begin: createGameHistoryDto.time_begin,
      points: createGameHistoryDto.points,
      user_id_winner: winner_user,
      user_id_loser: loser_user      
    })
    return ;
  }

  async all_history(){
    const game_history = await this.gameHistoryRepository.find({relations: {user_id_loser: true, user_id_winner: true}
      , select: {user_id_loser:{id:true, nick:true, intra_nick: true}, user_id_winner: {id:true, nick:true, intra_nick: true}}});
    return game_history;
  }

  async group_by_won_scores()
  {
    const userWins = await this.gameHistoryRepository
    .createQueryBuilder('gameHistory')
    .innerJoin('gameHistory.user_id_winner', 'user')
    .select('user.id', 'id')
    .addSelect('user.intra_nick', 'name')
    .addSelect('SUM(gameHistory.user_id_winner)*5', 'score')
    .groupBy('user.id')
    .getRawMany();
    return userWins;
  }

  async sum_score(user: User)
  {
    const sum = await this.gameHistoryRepository
    .createQueryBuilder('gameHistory')
    .select('SUM(gameHistory.points)', 'totalPoints')
    .where('gameHistory.user_id_winner = :userId', { userId: user.id })
    .orWhere('gameHistory.user_id_loser = :userId', { userId: user.id })
    .getRawOne();
    const totalPoints = sum?.totalPoints || 0;
    return parseInt(totalPoints);
  }
}
