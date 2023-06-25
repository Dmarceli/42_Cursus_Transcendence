import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/db_interactions_modules/users/users.module';
import { JwtService } from '@nestjs/jwt';
import { FortyTwoAuthStrategy } from './auth.strategy';
import { SessionSerializer } from './session.serializer';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
@Module({
  imports: [ 
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    PassportModule.register({ session: true }),
  ] ,
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService, 
    FortyTwoAuthStrategy,
    SessionSerializer
  ]
})
export class AuthModule {}
