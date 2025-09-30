import { IsString, MinLength, MaxLength, Matches, IsNotEmpty, IsEmail, IsOptional, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateFullnameDto {
  @IsString({ message: 'Nama lengkap harus berupa teks' })
  @Transform(({ value }) => value.trim())
  @MinLength(2, { message: 'Nama lengkap minimal 2 karakter' })
  @MaxLength(100, { message: 'Nama lengkap maksimal 100 karakter' })
  @Matches(/^[a-zA-ZÀ-ÖØ-öø-ÿ0-9_\s'-]+$/, {
    message:
      'Nama lengkap hanya boleh berisi huruf, angka, underscore (_), spasi, tanda hubung (-), dan apostrof (\')',
  })
  fullName: string;
}

export class UpdateUserDto {
  @IsString({ message: 'Username harus berupa teks' })
  @IsNotEmpty({ message: 'Username wajib diisi' })
  @MinLength(2, { message: 'Username minimal 2 karakter' })
  @MaxLength(50, { message: 'Username maksimal 50 karakter' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username hanya boleh berisi huruf, angka, dan underscore (_)',
  })
  username: string;

  @IsEmail({}, { message: 'Email harus berupa alamat email yang valid' })
  @MaxLength(254, { message: 'Email terlalu panjang (maksimal 254 karakter)' })
  email: string;

  @ValidateIf((o) => o.fullName !== null && o.fullName !== undefined && o.fullName !== '')
  @IsString({ message: 'Nama lengkap harus berupa teks' })
  @Transform(({ value }) => value?.trim())
  @MinLength(2, { message: 'Nama lengkap minimal 2 karakter' })
  @MaxLength(100, { message: 'Nama lengkap maksimal 100 karakter' })
  @Matches(/^[a-zA-ZÀ-ÖØ-öø-ÿ0-9_\s'-]+$/, {
    message:
      'Nama lengkap hanya boleh berisi huruf, angka, underscore (_), spasi, tanda hubung (-), dan apostrof (\')',
  })
  fullName?: string | null;
}


export class ChangePasswordDto {
  @IsString({ message: 'Password harus berupa teks' })
  @MaxLength(60, { message: 'Password maksimal 60 karakter' })
  oldPassword: string;

  @IsString({ message: 'Password harus berupa teks' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(60, { message: 'Password maksimal 60 karakter' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, {
    message: 'Password harus mengandung minimal satu huruf dan satu angka',
  })
  newPassword: string;
}