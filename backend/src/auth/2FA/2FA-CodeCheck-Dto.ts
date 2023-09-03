import { IsDefined, IsString } from 'class-validator';

export class TwoFACodeCheck {

  @IsString()
  id: string;

  @IsString()
  code: string;
}
  
  