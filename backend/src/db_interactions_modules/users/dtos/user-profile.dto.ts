import { IsNotEmpty, MaxLength } from 'class-validator';

export class UserProfileSettingsDto {

  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  @MaxLength(20, {message: 'Nickname is too long'})
  nickUpdate: string;
}
