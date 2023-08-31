import { IsString, MaxLength,MinLength, ValidateIf, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength, IsBoolean } from 'class-validator';

  export class CreateUserToChannDto {
    @IsNumber()
    id: number;

    @IsString()
    pass: string;

  }
  
  
  