import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CreateSubscribeDto {
    @IsString()
    @IsNotEmpty({ message: 'PlanId string is required' })
    planId: string;
    @IsNumber()
    @IsNotEmpty({ message: 'totalCount string is required' })
    totalCount: number;

}