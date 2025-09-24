import {
  IsString,
  IsEmail,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class LoginUserDto {
  @ValidateIf(o => !o.email)
  @IsString({ message: 'Username harus berupa teks' })
  @MaxLength(255, { message: 'Username terlalu panjang (maksimal 255 karakter)' })
  username?: string;

  @ValidateIf(o => !o.username)
  @IsEmail({}, { message: 'Email harus berupa alamat email yang valid' })
  @MaxLength(255, { message: 'Email terlalu panjang (maksimal 255 karakter)' })
  email?: string;

  @IsString({ message: 'Password harus berupa teks' })
  password: string;
}