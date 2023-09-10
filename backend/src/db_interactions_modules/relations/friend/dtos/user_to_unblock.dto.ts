import { IsDefined, IsInt } from 'class-validator';

export class UnblockUserDto {
  @IsInt()
  @IsDefined()
  user_to_unblock: number;
}