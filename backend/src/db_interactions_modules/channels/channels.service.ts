import { Injectable,ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,MoreThan, QueryFailedError } from 'typeorm';
import { Channel } from './channel.entity';
import { ChannelCreateDto } from './dtos/channelcreate.dto';
import { UserToChannelService } from '../relations/user_to_channel/user_to_channel.service';
import { channel } from 'diagnostics_channel';

@Injectable()
export class ChannelsService {

   constructor(
   @InjectRepository(Channel) private ChannelsRepository: Repository<Channel>,
   private UserToChannelService_: UserToChannelService ,
 ) {}


 async create(createChannelDto: ChannelCreateDto) {
  try {
    const response = await this.ChannelsRepository.save(createChannelDto)// Perform the database operation that may cause a duplicate key exception
    return response
  } catch (error) {
    if (error instanceof QueryFailedError) {
      throw new ConflictException('Duplicate key value found.');
    }
  }
  }

  async getChannelByID(channelID:number){
    return this.ChannelsRepository.findOne({where: {id :channelID}})
  }
  
  async all_channel(userID: number){
    const bannedList = await this.UserToChannelService_.getBannedChannelList(userID)
    const all_channels = await this.ChannelsRepository.find({where: {type: MoreThan(0)}})
    const filtered = all_channels.filter(channel => !bannedList.some(bannedChannel => bannedChannel.channel_id.id === channel.id))
    console.log(filtered)
    return filtered;


    // return await this.ChannelsRepository.find({
    //  // 0 is private message, it's supposed to not appear
    //   where: {type: MoreThan(0)}
    // })
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
