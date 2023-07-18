import { Injectable, Catch, ConflictException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository, QueryFailedError } from 'typeorm';
import { Response } from 'express';
import { CreateUserDto } from './dtos/user.dto';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}


  async createUser(User: CreateUserDto){
    try {
        const response = await this.userRepository.save({...User, creation_date : new Date(), last_joined_date : new Date(), lost_games: 0, won_games: 0, xp_total:0})
        return response
      } catch (error) {
        if (error instanceof QueryFailedError) {
          throw new ConflictException('Duplicate key value found.');
        }
      }
  }

  async findAll() {
    return await this.userRepository.find();
  }

   async findbyusername_(nick_:string, res: Response) {
   const resp= await this.userRepository.findOne({where: {
      nick: nick_
    }});
    console.log(resp)
    if(!resp)
      return res.status(404).json()
    else
      return res.status(200).json(resp);
    }
    
    async findByNick(nick_ :string) {
      if(!nick_)
        return null;
      const resp= await this.userRepository.findOne(
        {where: {nick: nick_}}
       );
       return resp;
     }
     
  async findByLogin(intra_nick_ :string) {
    if(!intra_nick_)
      return null;
    const resp= await this.userRepository.findOne(
      {where: {intra_nick: intra_nick_}}
     );
     return resp;
   }

  async leaderboardInfo()
  {
      const userWins = await this.userRepository
      .createQueryBuilder('user')
      .select('user.id', 'id')
      .addSelect('user.intra_nick', 'name')
      .addSelect('user.xp_total', 'score')
      .groupBy('user.id')
      .orderBy("user.xp_total", "DESC")
      .getRawMany();
      return userWins;
  }

   async findById(id_to_search :number) {
  
    const resp= await this.userRepository.findOne(
      {where: {id: id_to_search}}
     );
     return resp;
   }


  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
  }
