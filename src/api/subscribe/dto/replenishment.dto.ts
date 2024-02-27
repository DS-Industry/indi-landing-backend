import {IsDate, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class ReplenishmentDto {
    @IsString()
    @IsNotEmpty({ message: 'SubscribeId string is required' })
    subscribeId: string;
    @IsDate()
    @IsOptional()
    dateDebiting?: Date;
    @IsString()
    @IsNotEmpty({ message: 'Status string is required' })
    status: string;
    @IsString()
    @IsNotEmpty({ message: 'PayId string is required' })
    payId: string;
    @IsNumber()
    @IsNotEmpty({ message: 'Amount number is required' })
    amount: number;
}