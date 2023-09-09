import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Messages } from './db_interactions_modules/messages/messages.entity';
import { User } from './db_interactions_modules/users/user.entity';
import { Channel } from './db_interactions_modules/channels/channel.entity';
import { CreateMsgDto } from './db_interactions_modules/messages/dtos/message.dto';
import { UsersService } from './db_interactions_modules/users/users.service';
import { Socket, Server } from 'socket.io';
import { UserSocketArray } from './db_interactions_modules/users/classes/UsersSockets';
import { GameService } from './db_interactions_modules/game/game.service';
import { UserStatus } from './types/UserStatus';

@Injectable()
export class AppService {
 constructor(
   @InjectRepository(Messages) private messagesRepository: Repository<Messages>,
   @InjectRepository(User)private userRepository: Repository<User>,
   @InjectRepository(Channel)private channelRepository: Repository<Channel>,
   private usersService: UsersService,
   private gameService: GameService
 ) {}
 static UsersOnline: UserSocketArray[] = []

 async createMessage(msg_payload: CreateMsgDto){
  const user= await this.userRepository.findOne({where: {
     id:  msg_payload.authorId }    
  });
  const channel= await this.channelRepository.findOne({where:{
    id: msg_payload.channelId
  }})
  channel.last_message_on_channel=new Date()
  await this.channelRepository.save(channel)
    return await this.messagesRepository.save({...msg_payload,
    author: user,
    channel: channel});
 }
 
 async getMessages(): Promise<Messages[]> {
   return await this.messagesRepository.find();
 }

 async user_remove_disconect(client: Socket){
  this.usersService.remove_disconnect_User(client)
 }

 async add_user_to_lobby(client: Socket, server:Server, ChannelList: string[]){
  return this.usersService.addUserToLobby(client, server,ChannelList)
 }

 async user_to_notify(userID: number){
  return this.usersService.notifyUser(userID,AppService.UsersOnline)
 }

  // TODO: Parameter with user affected and check if friends
  async get_online_status_users() {
    let current_users = await this.usersService.findAll()
    const allUserStatus: UserStatus[] = current_users.map((currentUser) => {
      let IsOnline = AppService.UsersOnline.some((userOnline) => {
        return userOnline.user.id == currentUser.id;
      })
      let IsInGame = this.gameService.IsInGame(currentUser)
      let onlineStatus = IsInGame ? 0 : IsOnline ? 1 : 2;
      return {
        userId: currentUser.id,
        status: onlineStatus
      }
    });
    return allUserStatus;
  }

}