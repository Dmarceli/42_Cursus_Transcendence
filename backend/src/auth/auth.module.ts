import { Module } from '@nestjs/common';
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
import { GoogleAuthGuard } from './google/auth_google.guard';
import { UsersService } from 'src/db_interactions_modules/users/users.service';

@Module({
  imports: [ 
    // UsersModule,
    TypeOrmModule.forFeature([User]),
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
  ]
})
export class AuthModule {}
