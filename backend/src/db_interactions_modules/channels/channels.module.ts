import { Module, forwardRef } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { Channel } from './channel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserToChannelService } from '../relations/user_to_channel/user_to_channel.service';
import { UserToChannel } from '../relations/user_to_channel/user_to_channel.entity';
import { User } from '../users/user.entity';
import { Events } from '../events/events.entity';
import { EventsService } from '../events/events.service';
import { UsersService } from '../users/users.service';
import { EventsModule } from '../events/events.module';
import { AppModule } from 'src/app.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, UserToChannel, User, Events]),
    forwardRef(() => AppModule)
],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports : [ChannelsService]
})
export class ChannelsModule {}
