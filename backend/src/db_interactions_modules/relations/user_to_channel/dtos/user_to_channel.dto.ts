import { IsString, MaxLength,MinLength, ValidateIf, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength, IsBoolean } from 'class-validator';

  export class CreateUserToChannDto {

    @IsNumber()
    user_id: number;

    @IsNumber()
    channel_id: number;

    @IsBoolean()
    is_owner: boolean;

    @IsBoolean()
    is_admin: boolean;

    @IsBoolean()
    is_muted: boolean;

    @IsBoolean()
    is_banned: boolean;

  }
  
  
  