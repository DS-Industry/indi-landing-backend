import {IsDate, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class InfoSubscribeDto{
    @IsString()
    @IsOptional()
    subscribeId?: string;
    @IsDate()
    @IsOptional()
    dateDebiting?: Date;
    @IsString()
    @IsOptional()
    status?: string;
    @IsNumber()
    @IsOptional()
    amount?: number;
    @IsString()
    @IsOptional()
    name?: string;
}