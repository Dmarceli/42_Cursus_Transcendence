import { IsString, MaxLength,MinLength, ValidateIf, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength } from 'class-validator';

  export class EventCreateDto {

    // @IsNumber()
    // @IsDefined()
    // type: number;

    @IsDefined()
    requester_user: number;

    @IsDefined()
    decider_user: number;
  
    @IsDefined()
    message: string;
  }
  
  
  