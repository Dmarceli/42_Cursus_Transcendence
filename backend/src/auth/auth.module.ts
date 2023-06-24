import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/db_interactions_modules/users/users.module';
import { JwtService } from '@nestjs/jwt';
import { FortyTwoAuthGuard } from './auth.guard';
import { FortyTwoAuthStrategy } from './auth.strategy';

@Module({
  imports: [ 
    UsersModule
  ] ,
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService, 
    FortyTwoAuthStrategy
  ]
})
export class AuthModule {}
