import { Module } from '@nestjs/common';
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
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserToChannel,Channel, Messages]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: 30 },
    }),
    PassportModule.register({ session: true }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserToChannelService],
  exports: [UsersService]
})
export class UsersModule {}
