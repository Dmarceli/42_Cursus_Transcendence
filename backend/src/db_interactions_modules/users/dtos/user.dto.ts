import { IsString, MaxLength,MinLength, ValidateIf, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength, IsBoolean, isString } from 'class-validator';

  export class CreateUserDto {

    @IsString()
    nick: string;

    @IsString()
    intra_nick: string;

    @IsString()
    avatar: string;
  }
  
  
  