import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUserDto {

  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  @MaxLength(20, {message: 'Nickname is too long'})
  nickUpdate: string;
}