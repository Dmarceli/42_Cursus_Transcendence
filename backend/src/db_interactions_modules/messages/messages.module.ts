import { Module } from '@nestjs/common';
import { Messages } from './messages.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from '../channels/channel.entity';
import { UserToChannelService } from '../relations/user_to_channel/user_to_channel.service';
import { UserToChannel } from '../relations/user_to_channel/user_to_channel.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { friendService } from '../relations/friend/friend.service';
import { friend } from '../relations/friend/friend.entity';

@Module({  
    imports: [
    TypeOrmModule.forFeature([Messages, Channel, UserToChannel, User, friend])
],
  controllers: [MessagesController],
  providers: [MessagesService, UserToChannelService, UsersService, friendService],
  exports: [MessagesService]
})
export class MessagesModule {}
