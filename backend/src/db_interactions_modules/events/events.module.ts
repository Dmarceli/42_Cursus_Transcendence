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
import { GameService } from '../game/game.service';
import { GameHistoryModule } from '../game_history/game_history.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Events, Channel,User, Messages]),
    UsersModule,
    MessagesModule,
    GameHistoryModule,
    forwardRef(() => FriendModule),
  ],
  controllers: [EventsController],
  providers: [EventsService,AppService, GameService],
  exports: [EventsService]
})
export class EventsModule {}
