import { Module,forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppGateway } from '../app/app.gateway';
import { UserToChannelService } from '../relations/user_to_channel/user_to_channel.service';
import { UserToChannel } from '../relations/user_to_channel/user_to_channel.entity';
import { Channel } from '../channels/channel.entity';
import { Messages } from '../messages/messages.entity';
import { EventsModule } from '../events/events.module';
import { EventsService } from '../events/events.service';
import { Events } from '../events/events.entity';
import { friendService } from '../relations/friend/friend.service';
import { AppService } from 'src/app.service';
import { GameService } from '../game/game.service';
import { GameHistoryService } from '../game_history/game_history.service';
import { GameHistory } from '../game_history/game_history.entity';
import { friend } from '../relations/friend/friend.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([User,GameHistory, UserToChannel,Channel, Messages,Events, friend]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: 30 },
    }),
    PassportModule.register({ session: true }),
    
  ],
  controllers: [UsersController],
  providers: [UsersService, UserToChannelService,GameHistoryService, EventsService,GameService,friendService, AppService],
  exports: [UsersService]
})
export class UsersModule {}
