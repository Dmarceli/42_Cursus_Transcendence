import { IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class UserProfileSettingsDto {
  @IsNotEmpty({message: 'Nickname should not be empty'})
  @MaxLength(20, {message: 'Nickname is too long'})
  @Matches(/^[a-zA-Z0-9._-]{0,20}$/, {
    message: 'The name contains invalid characters',
  })
  nickUpdate: string;
}
