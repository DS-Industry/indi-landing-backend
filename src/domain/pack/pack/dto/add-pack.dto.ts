import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class AddPackDto {
    @IsString()
    @IsNotEmpty({ message: 'Name string is required' })
    name: string;
    @IsString()
    @IsOptional()
    description: string;
    @IsNumber()
    @IsNotEmpty({ message: 'SumMoney number is required'})
    sumMoney: number;
    @IsNumber()
    @IsNotEmpty({ message: 'SumPoint number is required'})
    sumPoint: number;
}