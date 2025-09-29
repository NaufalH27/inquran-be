import { Transform } from 'class-transformer';
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Username harus berupa teks' })
  @IsNotEmpty({ message: 'Username wajib diisi' })
  @MinLength(2, { message: 'Username minimal 2 karakter' })
  @MaxLength(50, { message: 'Username maksimal 50 karakter' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username hanya boleh berisi huruf, angka, dan underscore (_)',
  })
  username: string;

  @IsEmail({}, { message: 'Email harus berupa alamat email yang valid' })
  @MaxLength(50, { message: 'Username maksimal 50 karakter' })
  @MaxLength(254, { message: 'Email terlalu panjang (maksimal 254 karakter)' })
  email: string;

  @IsString({ message: 'Password harus berupa teks' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(60, { message: 'Password maksimal 60 karakter' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, {
    message: 'Password harus mengandung minimal satu huruf dan satu angka',
  })
  password: string;
}


export class CreateGoogleUserDto {
  @IsEmail({}, { message: 'Email harus berupa alamat email yang valid' })
  @MaxLength(254, { message: 'Email terlalu panjang (maksimal 254 karakter)' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Nama lengkap harus berupa teks' })
  @Transform(({ value }) => value?.trim())
  @MinLength(2, { message: 'Nama lengkap minimal 2 karakter' })
  @MaxLength(100, { message: 'Nama lengkap maksimal 100 karakter' })
  fullName?: string;

  @IsString()
  googleId: string;
}
