import { IsString, MaxLength,MinLength, ValidateIf, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength } from 'class-validator';

  export class CreateMsgDto {

    @IsNumber()
    @IsDefined()
    authorId: number;

    @IsDefined()
    message: string;
  
    @IsNumber()
    @IsDefined()
    channelId: number;
  }
  
  
  