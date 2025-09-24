import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
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