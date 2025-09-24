import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateFullnameDto {
  @IsString({ message: 'Nama lengkap harus berupa teks' })
  @Transform(({ value }) => value.trim())
  @MinLength(2, { message: 'Nama lengkap minimal 2 karakter' })
  @MaxLength(100, { message: 'Nama lengkap maksimal 100 karakter' })
  @Matches(/^[a-zA-ZÀ-ÖØ-öø-ÿ\s'-]+$/, {
    message: 'Nama lengkap hanya boleh berisi huruf, spasi, tanda hubung, atau apostrof',
  })
  fullName: string;
}
