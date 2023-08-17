import { Injectable, Catch, ConflictException, UnauthorizedException, Inject, forwardRef} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository, QueryFailedError } from 'typeorm';
import { Response } from 'express';
import { CreateUserDto } from './dtos/user.dto';
import { Socket, Server } from 'socket.io';
import { UserSocketArray } from './classes/UsersSockets';
import { getUserIDFromToken } from './getUserIDFromToken';
import { JwtService } from '@nestjs/jwt';
import { UserToChannel } from '../relations/user_to_channel/user_to_channel.entity';
import { Channel } from '../channels/channel.entity';
import { unlinkSync, existsSync, renameSync } from 'fs';

import { UserToChannelService } from '../relations/user_to_channel/user_to_channel.service';
import { AppService } from 'src/app.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    @InjectRepository(UserToChannel)
    private readonly userToChannel: Repository<UserToChannel>,
    @Inject(forwardRef(() => UserToChannelService))private userToChannelService: UserToChannelService,

  ) {
  }
  //UsersOnline: UserSocketArray[] = []


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
    // console.log(resp)
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

  

   async update_channels_on_list(UserId: number,ChannelId: number){
    
      //     let i=0;
      // AppService.UsersOnline.forEach((element) => {
      //   console.log( AppService.UsersOnline[i].user.id, AppService.UsersOnline[i].user.intra_nick, AppService.UsersOnline[i++].client.id)
      // })
    
    console.log("CHEGOU USER ID",UserId)
    const element= AppService.UsersOnline.find(element => element.user.id == UserId);
    // if(!element)
    //   console.log("ERROR on UPDATE CHANNELS LIST USER:",UserId)
    if(element)
      element.client.join(ChannelId.toString())
   }

   async addUserToLobby(client: Socket, server: Server,ChannelList: string[]){

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
    const resp = await this.userRepository.findOne({where: {id: payload.id}});
     if(!resp)
        return null
        const userChannels = await this.userToChannelService.findChannelsByID(resp.id);   
    userChannels.forEach((element) => {
     ChannelList.push(element.channel_id.id.toString())
    })
      AppService.UsersOnline.push(new UserSocketArray(resp,client))
      // let i=0;
      // AppService.UsersOnline.forEach((element) => {
      //   console.log(this.UsersOnline[i].user.id,this.UsersOnline[i].user.intra_nick,this.UsersOnline[i++].client.id)
      // })
     return true;
   }

   async notifyUser(user_id: number,UsersOnline : UserSocketArray[]){
    //console.log(UsersOnline)
    //  console.log('Notification sent to user:', user_id);
    //  let i=0;
    //  AppService.UsersOnline.forEach((user) => {
    //   console.log(this.UsersOnline[i].user.id,this.UsersOnline[i].user.intra_nick,this.UsersOnline[i++].client.id)
    // })
     const user = AppService.UsersOnline.find( User_ => User_.user.id === user_id)
     if(!user){
        console.log("FALHOU Notificação", user_id) 
      return;
     }
     user.client.emit("notification")
   }

   async remove_disconnect_User(client_: Socket){
    const Index = AppService.UsersOnline.findIndex( User_ => User_.client === client_)
    if(Index != -1)
      AppService.UsersOnline.splice(Index,1)
    
    //   let i=0;
    //   AppService.UsersOnline.forEach((user) => {
    //    console.log(this.UsersOnline[i].user.id,this.UsersOnline[i].user.intra_nick,this.UsersOnline[i++].client.id)
    //  })  
   }

	 async updateProfile(file: Express.Multer.File, userId: number, nickUpdate: string) {
    console.log(file);
		 const user = await this.findById(userId);
     if (file)
      this.updateAvatar(user, file);
    this.updateNick(user, nickUpdate);
     user.is_first_login= false
     await this.userRepository.save(user);
      return {
        status: 'success',
        message: 'File has been uploaded successfully',
        newAvatar: user.avatar
      };
    }

    updateAvatar(user: User, file: Express.Multer.File) {
      let prevUrl = user.avatar.split('/').pop();
      let prevAvatar = './uploads/' + prevUrl
      if (existsSync(prevAvatar)) {
        console.log("Deleting PREVIOUS AVATAR "+prevAvatar)
        unlinkSync(prevAvatar);
      }
      let extension = "."+file.originalname.split(".").pop()
      let newPathName = file.path+extension;
      if (existsSync(file.path)) {
        renameSync(file.path, newPathName);
      }
      let fileUrl = process.env.BACKEND_URL+"/users/avatar/"+file.filename+extension;
      user.avatar = fileUrl;
    }

    updateNick(user: User, nickUpdate: string){
      console.log("UPDATING NICK");
      console.log(user.nick);
      console.log(nickUpdate);
      user.nick = nickUpdate;
    }
}
