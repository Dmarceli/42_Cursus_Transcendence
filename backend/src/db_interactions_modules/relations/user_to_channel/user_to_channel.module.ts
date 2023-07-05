import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserToChannel } from './user_to_channel.entity';
import { UserToChannelService } from './user_to_channel.service';
import { UserToChannelController } from './user_to_channel.controller';
import { ChannelsService } from 'src/db_interactions_modules/channels/channels.service';
import { Channel } from 'src/db_interactions_modules/channels/channel.entity';
import { User } from 'src/db_interactions_modules/users/user.entity';
import { UsersService } from 'src/db_interactions_modules/users/users.service';



@Module({
    imports: [
        TypeOrmModule.forFeature([UserToChannel, Channel, User])
    ],
    controllers: [UserToChannelController],
    providers: [UserToChannelService, ChannelsService, UsersService]
})
export class UserToChannelModule { }
