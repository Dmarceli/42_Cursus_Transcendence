import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { Channel } from './channel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserToChannelService } from '../relations/user_to_channel/user_to_channel.service';
import { UserToChannel } from '../relations/user_to_channel/user_to_channel.entity';
import { User } from '../users/user.entity';
import { Events } from '../events/events.entity';
import { EventsService } from '../events/events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, UserToChannel, User, Events])
],
  controllers: [ChannelsController],
  providers: [ChannelsService, UserToChannelService, EventsService],
  exports : [ChannelsService]
})
export class ChannelsModule {}
