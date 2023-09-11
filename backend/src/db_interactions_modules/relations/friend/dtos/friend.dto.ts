import { IsString,Min,Max, MaxLength,MinLength, ValidateIf, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength } from 'class-validator';

  export class CreateFriendDto {

    @IsNumber()
    @Min(0)
    @Max(2147483647)
    user1Id: number;

    @IsNumber()
    @Min(0)
    @Max(2147483647)
    user2Id: number;

  }
  
  
  