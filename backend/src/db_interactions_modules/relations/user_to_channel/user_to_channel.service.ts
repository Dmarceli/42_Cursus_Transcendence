import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserToChannel } from './user_to_channel.entity';
import { CreateUserToChannDto } from './dtos/user_to_channel.dto';
import { User } from 'src/db_interactions_modules/users/user.entity';
import { Channel } from 'src/db_interactions_modules/channels/channel.entity';


@Injectable()
export class UserToChannelService {
  constructor(
    @InjectRepository(UserToChannel) private UserToChannelRepository: Repository<UserToChannel>,
  ) { }

  async joinchannel(channel: Channel, user: User) {
    let is_user_owner = false;
    const channels_users_count = (await this.usersonchannel(channel.id)).length
    if (!channels_users_count){
      is_user_owner = true;
    }
    return await this.UserToChannelRepository.save({
      user_id: user,
      channel_id: channel,
      is_owner: is_user_owner,
      is_admin: false,
      is_muted: false,
      is_banned: false,
    });
  }

  async leavechannel(id_us: number, id_ch: number) {
    const channel_to_leave = await this.UserToChannelRepository.find({
      where: {
        user_id: { id: id_us },
        channel_id: { id: id_ch }
      }
      ,
      relations: ['user_id', 'channel_id']
    });

    return await this.UserToChannelRepository.remove(channel_to_leave)
  }

  async usersonchannel(ch_id: number) {
    const usersInChannel = await this.UserToChannelRepository.find({
      where: { channel_id: { id: ch_id }},
     relations: ['user_id', 'channel_id'],
    });
    return usersInChannel
  }
  
  async findChannelsByID(us_id:number){
    const channels = await this.UserToChannelRepository.find(
      {
        where: {user_id: {id: us_id}, is_banned : false},
        relations: {channel_id:true}
      }
    )
    return channels
  }


  //  async createMessage(UserToChannel: UserToChannel): Promise<UserToChannel> {
  //    return await this.UserToChannelRepository.save(UserToChannel);
  //  }

  //  async getMessages(): Promise<UserToChannel[]> {
  //    return await this.UserToChannelRepository.find();
  //  }
}