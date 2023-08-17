import { IsString, IsDefined, IsNumber } from 'class-validator';

export class PrivateGameDto {

  @IsString()
  @IsDefined()
  player1_intra_nick: string;

  @IsString()
  @IsDefined()
  player2_intra_nick: string;

}
