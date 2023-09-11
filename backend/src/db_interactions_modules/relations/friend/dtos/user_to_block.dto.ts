import { IsDefined, IsInt, Min,Max } from 'class-validator';

export class BlockUserDto {
  @IsInt()
  @IsDefined()
  @Min(0)
  @Max(2147483647)
  user_to_block: number;
}