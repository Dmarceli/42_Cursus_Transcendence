import { IsString, MaxLength,MinLength, ValidateIf,Min,Max, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength, IsArray, IsNotEmpty, Matches } from 'class-validator';
import { isNumberObject } from 'util/types';

  export class ChannelCreateDto {

    @IsNumber()
    @IsDefined()
    @Min(0)
    @Max(2)
    type: number;

    @IsDefined()
    @IsString()
    @IsNotEmpty({message: 'Channel name should not be empty'})
    @MaxLength(20, {message: 'Channel Name is too long'})
    @Matches(/^[a-zA-Z0-9._-]{0,20}$/, {
      message: 'The name contains invalid characters',
    })
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
  
  
  