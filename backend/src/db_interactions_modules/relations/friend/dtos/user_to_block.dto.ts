import { IsDefined, IsInt } from 'class-validator';

export class BlockUserDto {
  @IsInt()
  @IsDefined()
  user_to_block: number;
}