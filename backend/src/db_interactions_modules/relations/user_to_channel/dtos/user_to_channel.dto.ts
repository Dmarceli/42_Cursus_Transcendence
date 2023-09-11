import { Optional } from '@nestjs/common';
import { IsString, MaxLength,MinLength,Min,Max, ValidateIf, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength, IsBoolean } from 'class-validator';

  export class CreateUserToChannDto {
    @IsNumber()
    @IsDefined()
    @Min(0)
    @Max(2147483647)
    id: number;

    //@Optional()
    pass: string;

  }

  export class InviteUserToChannDto {

    @IsDefined()
    @Min(0)
    @Max(2147483647)
    requester_user: number;

    @IsDefined()
    @Min(0)
    @Max(2147483647)
    invited_user: number;
  
    @IsDefined()
    message: string;

    @IsDefined()
    @Min(0)
    @Max(2147483647)
    channel: number;
  }
  