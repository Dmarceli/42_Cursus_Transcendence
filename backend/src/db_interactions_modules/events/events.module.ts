import { Module, forwardRef } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Events } from './events.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { AppModule } from 'src/app.module';
import { AppService } from 'src/app.service';
import { MessagesModule } from '../messages/messages.module';
import { MessagesService } from '../messages/messages.service';
import { Messages } from '../messages/messages.entity';
import { Channel } from '../channels/channel.entity';
import { FriendModule } from '../relations/friend/friend.module';
import { friendService } from '../relations/friend/friend.service';
import { GameModule } from '../game/games.module';
import { UserToChannel } from '../relations/user_to_channel/user_to_channel.entity';
import { UserToChannelService } from '../relations/user_to_channel/user_to_channel.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Events, Channel,User, Messages,UserToChannel]),
    UsersModule,
    MessagesModule,
    GameModule,
    forwardRef(() => FriendModule),
  ],
  controllers: [EventsController],
  providers: [EventsService,AppService, UsersService,UserToChannelService],
  exports: [EventsService]
})
export class EventsModule {}
