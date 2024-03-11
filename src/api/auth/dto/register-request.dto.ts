import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+91(\d{10})$/, {
    message: 'Phone number must be valid',
  })
  phone: string;
  @IsString()
  @IsNotEmpty({ message: 'UniqCard string is required' })
  uniqNomer: string;
  @IsString()
  @IsNotEmpty({ message: 'Password number is required' })
  password: string;
  @IsString()
  @IsNotEmpty({ message: 'Password number is required' })
  checkPassword: string;
}
