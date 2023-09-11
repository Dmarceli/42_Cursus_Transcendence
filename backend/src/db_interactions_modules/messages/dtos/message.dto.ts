import { IsString,Min,Max, MaxLength,MinLength, ValidateIf, IsIn, IsNumber, isNumber, maxLength, IsDefined, minLength } from 'class-validator';

  export class CreateMsgDto {

    @IsNumber()
    @IsDefined()
    @Min(0)
    @Max(2147483647)
    authorId: number;

    @IsDefined()
    message: string;
  
    @IsNumber()
    @IsDefined()
    @Min(0)
    @Max(2147483647)
    channelId: number;
  }
  
  
  