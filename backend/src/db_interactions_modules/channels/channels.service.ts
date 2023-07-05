import { Injectable,ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,MoreThan, QueryFailedError } from 'typeorm';
import { Channel } from './channel.entity';
import { ChannelCreateDto } from './dtos/channelcreate.dto';

@Injectable()
export class ChannelsService {

   constructor(
   @InjectRepository(Channel) private ChannelsRepository: Repository<Channel>,
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
  
  async all_channel(){
    return await this.ChannelsRepository.find({
     // 0 is private message, it's supposed to not appear
      where: {type: MoreThan(0)}
    })
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
