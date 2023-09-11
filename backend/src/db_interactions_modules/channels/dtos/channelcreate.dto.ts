import { IsString, MaxLength,MinLength, ValidateIf,Min,Max, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength, IsArray } from 'class-validator';
import { isNumberObject } from 'util/types';

  export class ChannelCreateDto {

    @IsNumber()
    @IsDefined()
    @Min(0)
    @Max(2)
    type: number;

    @IsDefined()
    @IsString()
    channel_name: string;
    
    @IsDefined()
    password: string;

    @IsDefined()
    @IsArray({})
    @Min(0,{each: true})
    @Max(2147483647, {each: true})
    invitedusers: [];
  }


  export class ChannelProtectDto {

    @IsNumber()
    @IsDefined()
    @Min(0)
    @Max(2147483647)
    channel_id: number;

    @IsDefined()
    @IsString()
    newPassword: string;
  }
  
  
  