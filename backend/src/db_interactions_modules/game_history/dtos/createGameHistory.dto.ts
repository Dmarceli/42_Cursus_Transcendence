import { IsString, MaxLength,MinLength, ValidateIf, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength, IsDate } from 'class-validator';

  export class CreateGameHistoryDto {

    @IsNumber()
    winnerId: number;

    @IsNumber()
    loserId: number;
    
    @IsNumber()
    points: number;

    time_begin: any;

  }
  
  
  