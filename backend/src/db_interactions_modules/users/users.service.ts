import { Injectable, Catch, ConflictException, UnauthorizedException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository, QueryFailedError } from 'typeorm';
import { Response } from 'express';
import { CreateUserDto } from './dtos/user.dto';
import { Socket } from 'socket.io';
import { UserSocketArray } from './classes/UsersSockets';
import { getUserIDFromToken } from './getUserIDFromToken';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    
  ) {
    this.UsersOnline = []
  }
  UsersOnline: UserSocketArray[] = []


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


   async findById(id_to_search :number) {
  
    const resp= await this.userRepository.findOne(
      {where: {id: id_to_search}}
     );
     return resp;
   }

  
   async addUserToLobby(client: Socket){
    const token = client.handshake.auth.token;
    let payload;
    try {
       payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: `${process.env.JWT_SECRET_KEY}`
        }
      );
    } catch {
      console.log("User Unhautorized")
      return null
    } 
    const resp= await this.userRepository.findOne(
      {where: {id: payload.id}}
     );
     if(!resp)
     return null
      this.UsersOnline.push(new UserSocketArray(resp,client))
     return true;
   }

   async remove_disconnect_User(client_: Socket){
    const Index = this.UsersOnline.findIndex( User_ => User_.client === client_)
    if(Index != -1)
      this.UsersOnline.splice(Index,1)
    console.log(this.UsersOnline)
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
