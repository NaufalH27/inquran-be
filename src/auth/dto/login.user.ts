import {
  IsString,
  IsEmail,
  MaxLength,
  ValidateIf,
  IsIn,
} from 'class-validator';

export class LoginUserDto {
  @ValidateIf(o => o.loginType === 'username')
  @IsString({ message: 'Username harus berupa teks' })
  @MaxLength(255, { message: 'Username terlalu panjang (maksimal 255 karakter)' })
  username?: string;

  @ValidateIf(o => o.loginType === 'email')
  @IsEmail({}, { message: 'Email harus berupa alamat email yang valid' })
  @MaxLength(255, { message: 'Email terlalu panjang (maksimal 255 karakter)' })
  email?: string;

  @IsString({ message: 'Password harus berupa teks' })
  password: string;

  @IsIn(['username', 'email'], { message: 'loginType harus berupa "username" atau "email"' })
  loginType: 'username' | 'email';
}