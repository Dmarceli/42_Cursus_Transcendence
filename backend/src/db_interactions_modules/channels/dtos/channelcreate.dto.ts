import { IsString, MaxLength,MinLength, ValidateIf, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength } from 'class-validator';

  export class ChannelCreateDto {

    @IsNumber()
    @IsDefined()
    type: number;

    @IsDefined()
    channel_name: string;
  
    password: string;
  }
  
  
  