import { Injectable,ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,MoreThan, QueryFailedError } from 'typeorm';
import { Channel } from './channel.entity';
import { ChannelCreateDto } from './dtos/channelcreate.dto';
import { UserToChannelService } from '../relations/user_to_channel/user_to_channel.service';
import { channel } from 'diagnostics_channel';
import { User } from '../users/user.entity';
import { EventsService } from '../events/events.service';
import { EventCreateDto } from '../events/dtos/events.dto';

@Injectable()
export class ChannelsService {

   constructor(
   @InjectRepository(Channel) private ChannelsRepository: Repository<Channel>,
   private UserToChannelService_: UserToChannelService ,
   @InjectRepository(User) private UserRepository: Repository<User>,
   private eventService: EventsService
 ) {}


 async create(createChannelDto: ChannelCreateDto, creator_user: number) {
    const all_channels = await this.ChannelsRepository.findOne({where: {type: MoreThan(0), channel_name: createChannelDto.channel_name}})
    if(all_channels){
      throw new ConflictException('Duplicate key value found.');
     return;
    }
    let pwd = createChannelDto.password;
    if(createChannelDto.type != 2){
      pwd = null;
    }    
    const response = await this.ChannelsRepository.save({...createChannelDto, password: pwd})
    createChannelDto.invitedusers.forEach( async element => {
      const user_to_join = await this.UserRepository.findOne({where: {id: element}})
      if(user_to_join){
        await this.UserToChannelService_.joinchannel(response,user_to_join,pwd)
        const eventDto = {
          requester_user: creator_user,
          decider_user: user_to_join.id,
          message: `${creator_user} added you to channel ${createChannelDto.channel_name}`
        }
        await this.eventService.create(eventDto,1)
      }
    })
    return response
  
  
  }

  async getChannelByID(channelID:number){
    return this.ChannelsRepository.findOne({where: {id :channelID}})
  }
  
  async all_channel(userID: number){
    const bannedList = await this.UserToChannelService_.getBannedChannelList(userID)
    const all_channels = await this.ChannelsRepository.find({where: {type: MoreThan(0)}})
    const filtered = all_channels.filter(channel => !bannedList.some(bannedChannel => bannedChannel.channel_id.id === channel.id))
    return filtered;
  }
  // findAll() {
  //   return `This action returns all channels`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} channel`;
  // }

  // update(id: number, updateChannelDto: UpdateChannelDto) {
  //   return `This action updates a #${id} channel`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} channel`;
  // }
}
