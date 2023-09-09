import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Messages } from './messages.entity';
import { Channel } from '../channels/channel.entity';
import { UserToChannelService } from '../relations/user_to_channel/user_to_channel.service';
 import { UserToChannel } from '../relations/user_to_channel/user_to_channel.entity';
import { User } from '../users/user.entity';
import { friendService } from '../relations/friend/friend.service';
import { Events } from '../events/events.entity';
@Injectable()
export class MessagesService {
 constructor(
   @InjectRepository(Messages) private messagesRepository: Repository<Messages>,
   @InjectRepository(Channel) private channelRepository: Repository<Channel>,
   @InjectRepository(Events) private eventsRepository: Repository<Events>,
   @InjectRepository(UserToChannel)private readonly userToChannel: Repository<UserToChannel>,
   private user_to_channel_service: UserToChannelService,
   private friendservice: friendService
 ) {}
 async createMessage(Messages: Messages): Promise<Messages> {
   return await this.messagesRepository.save(Messages);
 }
 
 async findMessagesByChannelId(id_given : number,user: User){
  if (!id_given || !user){
    return;
  }
  let messageList: Array<Messages> = [];
  const blocked_users=await (await this.friendservice.get_blockedusers(user.id))
  let blocked_users_id: Array<Number> = [];
  blocked_users.forEach(element => {
    blocked_users_id.push(element.id)
  });
  const channel= await this.channelRepository.findOne({where: {id:  id_given}})
  const messages = await this.messagesRepository.find({
    where: {channel: {id: channel.id}},
    relations: ['author'],
    select: { author: { nick: true, id: true } }
    ,order:{
      id: "ASC"
    }
  });

  for (const k in messages) {
    if(!blocked_users_id.includes(messages[k].author.id)){
      messageList.push(messages[k])
    }
  }
  return messageList
 }

 async getMessages(): Promise<Messages[]> {
   return await this.messagesRepository.find();
 }
}
