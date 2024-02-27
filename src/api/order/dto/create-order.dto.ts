import {IsNotEmpty, IsNumber} from "class-validator";

export class CreateOrderDto{
    @IsNumber()
    @IsNotEmpty({ message: 'Amount number is required' })
    amount: number;
}