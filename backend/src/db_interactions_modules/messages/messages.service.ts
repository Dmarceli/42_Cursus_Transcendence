import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Messages } from './messages.entity';
import { Channel } from '../channels/channel.entity';
 
@Injectable()
export class MessagesService {
 constructor(
   @InjectRepository(Messages) private messagesRepository: Repository<Messages>,
   @InjectRepository(Channel) private channelRepository: Repository<Channel>,
 ) {}
 async createMessage(Messages: Messages): Promise<Messages> {
   return await this.messagesRepository.save(Messages);
 }
 
 async findMessagesByChannelId(id_given : number){
  const channel= await this.channelRepository.find(
  {
    where: {id:  id_given}
  }
  )
  const messages = await this.messagesRepository.find({
    where: {channel: channel},
    relations: ['author'],
    select: { author: { nick: true } }
    ,order:{
      id: "ASC"
    }
  });
  
  return messages
 }

 async getMessages(): Promise<Messages[]> {
   return await this.messagesRepository.find();
 }
}