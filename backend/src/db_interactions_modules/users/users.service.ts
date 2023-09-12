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
    return await this.userRepository.find({
      select: [
          "id",
          "nick",
          "intra_nick",
          "avatar",
          "lost_games",
          "won_games",
          "xp_total",
          "TwoFAEnabled",
          "creation_date",
          "last_joined_date",
          "is_first_login"
        ]});
  }

   async findbyusername_(nick_:string, res: Response) {
		try {
   	const resp= await this.userRepository.findOne({where: {
   	   nick: nick_
   	 }});
   	 if(!resp) {
   	  return res.status(404).json()
		 }
   	 else {
      let fileName = './uploads/' + resp.avatar.split('/').pop();
			if (!resp.avatar || !existsSync(fileName)) {
				resp.avatar = process.env.BACKEND_URL + '/users/avatar/default.jpg';
        await this.userRepository.save(resp);
			}
   	   return res.status(200).json(resp);
		}
		} catch (error) {
			console.log(error);
    }
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
		 if(!resp) {
			return null
		}
    let fileName = './uploads/' + resp.avatar.split('/').pop();
		if (!resp.avatar || !existsSync(fileName)) {
		 resp.avatar = process.env.BACKEND_URL + '/users/avatar/default.jpg';
     await this.userRepository.save(resp);
		}
		return resp;
   }

  

   async update_channels_on_list(UserId: number,ChannelId: number){
    const element= AppService.UsersOnline.find(element => element.user.id == UserId);
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
      console.log("User Unauthorized")
      return null
    } 
    const user_logged = AppService.UsersOnline.find( User_ => User_.user.id == payload.id)
    if(user_logged)
    {
      if (client.handshake.auth.privateWindow == user_logged.privateWindow
        && client.handshake.auth.userAgent == user_logged.userAgent) {
        user_logged.client.emit("DisconnectSocketToken")
      }
      else
        user_logged.client.emit("DeletingToken")
      this.remove_disconnect_User(user_logged.client)
      
    }
    const resp = await this.userRepository.findOne({where: {id: payload.id}});
    if(!resp)
        return null
    const userChannels = await this.userToChannelService.findChannelsByID(resp.id);   
    userChannels.forEach((element) => {
     ChannelList.push(element.channel_id.id.toString())
    })
      AppService.UsersOnline.push(new UserSocketArray(resp,client, client.handshake.auth.privateWindow, client.handshake.auth.userAgent))
      
     return true;
   }

   async notifyUser(user_id: number,UsersOnline : UserSocketArray[]){
     const user = AppService.UsersOnline.find( User_ => User_.user.id == user_id)
     if(!user){
      return;
     }
     user.client.emit("notification")
   }

   async remove_disconnect_User(client_: Socket){
    const Index = AppService.UsersOnline.findIndex( User_ => User_.client == client_)
    if(Index != -1)
      AppService.UsersOnline.splice(Index,1)
   }

	 async updateProfile(file: Express.Multer.File, userId: number, nickUpdate: string) {
    let error_ :Boolean = false; 
		 const user = await this.findById(userId);
     if (file)
      this.updateAvatar(user, file);
    this.updateNick(user, nickUpdate);
     user.is_first_login= false
     try{await this.userRepository.save(user);
      return {
        status: 'success',
        message: 'File has been uploaded successfully',
        newAvatar: user.avatar
      };
      }
      catch(error){error_ = true}
    if(error_){
      throw new ConflictException('Duplicate key value found.');
    }
    }

    updateAvatar(user: User, file: Express.Multer.File) {

      let prevFileName = user.avatar.split('/').pop();
      let prevAvatarPath = './uploads/' + prevFileName
      if (existsSync(prevAvatarPath) && prevFileName != "default.jpg") {
        unlinkSync(prevAvatarPath);
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
      user.nick = nickUpdate;
    }
}
