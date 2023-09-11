import { IsString,Min,Max, MaxLength,MinLength, ValidateIf, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength, IsArray } from 'class-validator';
import { isMap } from 'util/types';

  export class EventCreateDto {

    // @IsNumber()
    // @IsDefined()
    // type: number;

    @IsDefined()
    @Min(0)
    @Max(2147483647)
    requester_user: number;

    @IsDefined()
    @Min(0)
    @Max(2147483647)
    decider_user: number;
  
    @IsDefined()
    message: string;
  }


