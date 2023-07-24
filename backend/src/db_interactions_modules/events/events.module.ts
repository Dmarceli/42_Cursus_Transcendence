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

@Module({
  imports: [
    TypeOrmModule.forFeature([Events, Channel,User, Messages]),
    UsersModule,
    MessagesModule,
   
],
  controllers: [EventsController],
  providers: [EventsService,AppService],
  exports: [EventsService]
})
export class EventsModule {}
