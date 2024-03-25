import {IsNotEmpty, IsString, Matches} from "class-validator";

export class ChangePasswordOtpRequestDto {
    @IsString()
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(/^\+91(\d{10})$/, {
        message: 'Phone number must be valid',
    })
    phone: string;
}