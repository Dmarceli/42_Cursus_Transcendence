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
    try {// Perform the database operation that may cause a duplicate key exception
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
