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

  async get_history(id: string){
    const game_history = await this.gameHistoryRepository.find({relations: {user_id_loser: true, user_id_winner: true}
      , select: {user_id_loser:{id:true, nick:true, intra_nick: true}, user_id_winner: {id:true, nick:true, intra_nick: true}}});
    return game_history;
  }
}
