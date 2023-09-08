import { Optional } from '@nestjs/common';
import { IsString, MaxLength,MinLength, ValidateIf, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength, IsBoolean } from 'class-validator';

  export class CreateUserToChannDto {
    @IsNumber()
    id: number;

    //@Optional()
    pass: string;

  }

  export class InviteUserToChannDto {

    @IsDefined()
    requester_user: number;

    @IsDefined()
    invited_user: number;
  
    @IsDefined()
    message: string;

    @IsDefined()
    channel: number;
  }
  
  
  
  
  