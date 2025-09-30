import { IsNumber } from 'class-validator';

export class FavoriteDto {
  @IsNumber()
  surah_number: number;

  @IsNumber()
  ayah_number: number;
}