import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Messages } from './db_interactions_modules/messages/messages.entity';
import { User } from './db_interactions_modules/users/user.entity';
import { Channel } from './db_interactions_modules/channels/channel.entity';
import { CreateMsgDto } from './db_interactions_modules/messages/dtos/message.dto';
 
@Injectable()
export class AppService {
 constructor(
   @InjectRepository(Messages) private messagesRepository: Repository<Messages>,
   @InjectRepository(User)private userRepository: Repository<User>,
   @InjectRepository(Channel)private channelRepository: Repository<Channel>
 ) {}


 async createMessage(msg_payload: CreateMsgDto){
  const user= await this.userRepository.findOne({where: {
     id:  msg_payload.authorId }    
  });
  const channel= await this.channelRepository.findOne({where:{
    id: msg_payload.channelId
  }})
  console.log(msg_payload.channelId)
    return await this.messagesRepository.save({...msg_payload,
    author: user,
    channel: channel});
 }
 
 async getMessages(): Promise<Messages[]> {
   return await this.messagesRepository.find();
 }
}