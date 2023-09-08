import { Module , forwardRef} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
// import { UsersModule } from 'src/db_interactions_modules/users/users.module';
import { JwtService } from '@nestjs/jwt';
import { FortyTwoAuthStrategy } from './42/auth.strategy';
import { SessionSerializer } from './42/session.serializer';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthStrategy } from './jwt/jwt-auth.strategy';
import { GoogleStrategy } from './google/auth_google.strategy';
import { TwoFactorAuthService } from './2FA/2FA-service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/db_interactions_modules/users/user.entity';
import { UsersService } from 'src/db_interactions_modules/users/users.service';
import { GoogleAuthGuard } from './google/auth_google.guard';
import { UserToChannel } from 'src/db_interactions_modules/relations/user_to_channel/user_to_channel.entity';
import { Channel } from 'src/db_interactions_modules/channels/channel.entity';
import { UsersModule } from 'src/db_interactions_modules/users/users.module';
import { AppModule } from 'src/app.module';
import { UserToChannelService } from 'src/db_interactions_modules/relations/user_to_channel/user_to_channel.service';
import { Messages } from 'src/db_interactions_modules/messages/messages.entity';
import { EventsService } from 'src/db_interactions_modules/events/events.service';
import { Events } from 'src/db_interactions_modules/events/events.entity';
import { friendService } from 'src/db_interactions_modules/relations/friend/friend.service';
import { friend } from 'src/db_interactions_modules/relations/friend/friend.entity';
import { AppService } from 'src/app.service';
import { GameService } from 'src/db_interactions_modules/game/game.service';
import { GameHistoryService } from 'src/db_interactions_modules/game_history/game_history.service';
import { GameHistory } from 'src/db_interactions_modules/game_history/game_history.entity';
@Module({
  imports: [ 
    // UsersModule,
    TypeOrmModule.forFeature([User,GameHistory, UserToChannel,Channel,friend, Messages,Events]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: 30 },
    }),
    PassportModule.register({ session: true }),
   
  ] ,
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService, 
    FortyTwoAuthStrategy,
    GoogleAuthGuard,
    SessionSerializer,
    JwtAuthStrategy,
    GoogleStrategy,
    UsersService,
    TwoFactorAuthService,
    UserToChannelService,
    EventsService,
    friendService,
    AppService,
    GameService,
    GameHistoryService
  ]
})
export class AuthModule {}
