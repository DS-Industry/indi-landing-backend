import {IsDate, IsNotEmpty, IsNumber, IsOptional} from "class-validator";

export class AddRemainsDto {
    @IsNumber()
    @IsNotEmpty({ message: 'CardId number is required' })
    cardId: number;
    @IsNumber()
    @IsNotEmpty({ message: 'RemainsPoint string is required' })
    remainsPoint: number;
    @IsDate()
    @IsOptional()
    burnDate?: Date;
}
