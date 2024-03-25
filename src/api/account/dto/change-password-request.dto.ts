import {IsNotEmpty, IsNumberString, IsString, Matches, MaxLength, MinLength} from "class-validator";

export class ChangePasswordRequestDto {
    @IsString()
    @IsNotEmpty({ message: 'New password number is required' })
    newPassword: string;
    @IsString()
    @IsNotEmpty({ message: 'New password number is required' })
    checkNewPassword: string;
    @IsNumberString()
    @MinLength(6, { message: 'Otp must be valid' })
    @MaxLength(6, { message: 'Otp must be valid' })
    otp: string;
}