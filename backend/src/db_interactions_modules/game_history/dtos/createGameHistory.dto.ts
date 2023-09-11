import { IsString, MaxLength,Max,Min,MinLength, ValidateIf, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength, IsDate } from 'class-validator';

  export class CreateGameHistoryDto {

    @IsNumber()
    @Min(0)
    @Max(2147483647)
    winnerId: number;

    @IsNumber()
    @Min(0)
    @Max(2147483647)
    loserId: number;
    
    @IsNumber()
    @Min(0)
    @Max(2147483647)
    points: number;

    time_begin: any;

  }
  
  
  