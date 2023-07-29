import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserToChannel } from './user_to_channel.entity';
import { UserToChannelService } from './user_to_channel.service';
import { UserToChannelController } from './user_to_channel.controller';
import { ChannelsService } from 'src/db_interactions_modules/channels/channels.service';
import { Channel } from 'src/db_interactions_modules/channels/channel.entity';
import { User } from 'src/db_interactions_modules/users/user.entity';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { Events } from 'src/db_interactions_modules/events/events.entity';
import { EventsService } from 'src/db_interactions_modules/events/events.service';
import { AppModule } from 'src/app.module';
import { FriendModule } from '../friend/friend.module';
import { friendService } from '../friend/friend.service';
import { friend } from '../friend/friend.entity';


@Module({
    imports: [
        TypeOrmModule.forFeature([UserToChannel, Channel, User, Events, friend])
        ,forwardRef(() => AppModule),
        FriendModule,
    ],
    controllers: [UserToChannelController],
    providers: [UserToChannelService, ChannelsService, UsersService, EventsService, friendService],
    exports:[UserToChannelService, friendService]
})
export class UserToChannelModule { }