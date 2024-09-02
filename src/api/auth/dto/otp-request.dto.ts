import {IsEmail, IsNotEmpty, IsOptional, IsString, Matches} from 'class-validator';
export class OtpRequestDto{
    @IsEmail()
    @IsNotEmpty({ message: 'Email is required' })
    email:string;
    @IsString()
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(/^\+91(\d{10})$/, {
        message: 'Phone number must be valid',
    })
    phone: string;
    @IsString()
    @IsNotEmpty({ message: 'UniqCard string is required' })
    uniqNomer: string;
    @IsOptional()
    @IsString()
    invitedCode?: string;
}