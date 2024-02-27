import {IsDate, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class AddSubscribeDto {
    @IsString()
    @IsNotEmpty({ message: 'SubscribeId string is required' })
    subscribeId: string;
    @IsNumber()
    @IsNotEmpty({ message: 'ClientId string is required' })
    clientId: number;
    @IsDate()
    @IsOptional()
    dateDebiting?: Date;
    @IsString()
    @IsNotEmpty({ message: 'Status string is required' })
    status: string;
}