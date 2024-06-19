import {IsNotEmpty, IsNumber} from "class-validator";

export class ApplyPackDto {
    @IsNumber()
    @IsNotEmpty({ message: 'PackId number is required' })
    packId: number;
}