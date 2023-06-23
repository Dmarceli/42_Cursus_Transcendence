import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserToChannel } from './user_to_channel.entity';
import { UserToChannelService } from './user_to_channel.service';
import { UserToChannelController } from './user_to_channel.controller';
@Module({
    imports: [
        TypeOrmModule.forFeature([UserToChannel])
    ],
    controllers: [UserToChannelController],
    providers: [UserToChannelService]
})
export class UserToChannelModule { }
