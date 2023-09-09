import { Module,forwardRef } from '@nestjs/common';
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
import { EventsService } from '../events/events.service';
import { Events } from '../events/events.entity';
import { AppModule } from 'src/app.module';
import { GameService } from '../game/game.service';
import { GameModule } from '../game/games.module';
import { GameHistoryService } from '../game_history/game_history.service';
import { GameHistory } from '../game_history/game_history.entity';

@Module({  
    imports: [
    TypeOrmModule.forFeature([Messages, Channel, UserToChannel, User, friend, Events,GameHistory,UserToChannel]),
    forwardRef(() => AppModule), GameModule
],
  controllers: [MessagesController],
  providers: [MessagesService, UserToChannelService, UsersService, friendService, EventsService, GameService, GameHistoryService,UserToChannelService],
  exports: [MessagesService]
})
export class MessagesModule {}
