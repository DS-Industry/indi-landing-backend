import {IsDate, IsNotEmpty, IsOptional, IsString} from "class-validator";

export class SubscribeDto {
    @IsString()
    @IsNotEmpty({ message: 'SubscribeId string is required' })
    subscribeId: string;
    @IsDate()
    @IsOptional()
    dateDebiting?: Date;
    @IsString()
    @IsNotEmpty({ message: 'Status string is required' })
    status: string;
}