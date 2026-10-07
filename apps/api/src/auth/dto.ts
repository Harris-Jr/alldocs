import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CredentialsDto {
  @IsEmail({}, { message: 'Enter a valid email address.' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(200)
  password!: string;
}
