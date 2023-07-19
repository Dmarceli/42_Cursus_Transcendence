import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Events } from './events.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Events, User])
],
  controllers: [EventsController],
  providers: [EventsService, UsersService],
  exports: [EventsService]
})
export class EventsModule {}
