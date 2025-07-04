import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  IsIn,
} from 'class-validator';

@ValidatorConstraint({ name: 'UsernameOrEmailRequired', async: false })
class UsernameOrEmailRequired implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const { username, email } = args.object as any;
    return !!(username || email);
  }

  defaultMessage() {
    return 'Either username or email must be provided.';
  }
}

export class LoginUserDto {
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  @MinLength(2, { message: 'Username must be at least 2 characters long' })
  @MaxLength(50, { message: 'Username must not exceed 50 characters' })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  password: string;

  @IsIn(['username', 'email'], { message: 'login_type must be either "username" or "email"' })
  loginType: 'username' | 'email';

  @Validate(UsernameOrEmailRequired)
  _atLeastOneIdentifier: boolean;
}
