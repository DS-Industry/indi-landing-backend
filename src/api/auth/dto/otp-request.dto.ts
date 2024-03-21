import{ IsEmail, IsNotEmpty } from 'class-validator';
export class OtpRequestDto{
    @IsEmail()
    @IsNotEmpty({ message: 'Email is required' })
    email:string;
}