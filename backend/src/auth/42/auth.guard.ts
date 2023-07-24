import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FortyTwoAuthGuard extends AuthGuard('42') {
  
    async canActivate(context: ExecutionContext) {
    try{
      await super.canActivate(context);
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return true;}
    catch(error)
    {
      console.log("INTRA - " + error.message)
      throw new UnauthorizedException("INTRA - " + error.message);
    }
  }
}