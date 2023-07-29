import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Messages } from './db_interactions_modules/messages/messages.entity';
import { User } from './db_interactions_modules/users/user.entity';
import { Channel } from './db_interactions_modules/channels/channel.entity';
import { CreateMsgDto } from './db_interactions_modules/messages/dtos/message.dto';
import { UsersService } from './db_interactions_modules/users/users.service';
import { Socket, Server } from 'socket.io';
import { UserToChannelService } from './db_interactions_modules/relations/user_to_channel/user_to_channel.service';
@Injectable()
export class AppService {
 constructor(
   @InjectRepository(Messages) private messagesRepository: Repository<Messages>,
   @InjectRepository(User)private userRepository: Repository<User>,
   @InjectRepository(Channel)private channelRepository: Repository<Channel>,
   private usersService: UsersService,
 ) {}


 async createMessage(msg_payload: CreateMsgDto){
  const user= await this.userRepository.findOne({where: {
     id:  msg_payload.authorId }    
  });
  const channel= await this.channelRepository.findOne({where:{
    id: msg_payload.channelId
  }})
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

 async user_to_notify(client: number){
  return this.usersService.notifyUser(client)
 }


}