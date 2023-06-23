import { IsString, MaxLength,MinLength, ValidateIf, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength } from 'class-validator';

  export class CreateFriendDto {

    @IsNumber()
    user1Id: number;

    @IsNumber()
    user2Id: number;

  }
  
  
  