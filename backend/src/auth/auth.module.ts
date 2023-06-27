import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/db_interactions_modules/users/users.module';
import { JwtService } from '@nestjs/jwt';
import { FortyTwoAuthStrategy } from './auth.strategy';
import { SessionSerializer } from './session.serializer';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthStrategy } from './jwt-auth.strategy';
import { GoogleStrategy } from './auth_google.strategy';

@Module({
  imports: [ 
    UsersModule,
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
    SessionSerializer,
    JwtAuthStrategy,
    GoogleStrategy
  ]
})
export class AuthModule {}
