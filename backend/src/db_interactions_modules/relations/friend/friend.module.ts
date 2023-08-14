import { Module } from '@nestjs/common';
import { friend } from './friend.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { friendsController } from './friend.controller';
import { friendService } from './friend.service';
import { User } from 'src/db_interactions_modules/users/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([friend, User])
    ],
    controllers: [friendsController],
    providers: [friendService],
    exports: [friendService]
})
export class FriendModule {}
