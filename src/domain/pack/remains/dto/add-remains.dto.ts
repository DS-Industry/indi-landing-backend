import {IsNotEmpty, IsNumber} from "class-validator";

export class AddRemainsDto {
    @IsNumber()
    @IsNotEmpty({ message: 'ClientId string is required' })
    clientId: number;
    @IsNumber()
    @IsNotEmpty({ message: 'RemainsPoint string is required' })
    remainsPoint: number;
}