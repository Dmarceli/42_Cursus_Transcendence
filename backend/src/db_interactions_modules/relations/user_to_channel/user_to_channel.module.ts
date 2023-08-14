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
import { UsersModule } from 'src/db_interactions_modules/users/users.module';
import { AppService } from 'src/app.service';
import { Messages } from 'src/db_interactions_modules/messages/messages.entity';
import { EventsModule } from 'src/db_interactions_modules/events/events.module';


@Module({
    imports: [
        TypeOrmModule.forFeature([UserToChannel, Channel, User, Events, Messages])
        ,forwardRef(() => AppModule),
    ],
    controllers: [UserToChannelController],
    providers: [UserToChannelService],
    exports:[UserToChannelService]
})
export class UserToChannelModule { }