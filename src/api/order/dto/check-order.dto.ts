import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CheckOrderDto{
    response:{
        razorpay_payment_id: string,
        razorpay_order_id: string,
        razorpay_signature: string,
    };
    @IsNumber()
    @IsNotEmpty({ message: 'DeviceId number is required' })
    deviceId: number;
    @IsNumber()
    @IsNotEmpty({ message: 'Amount number is required' })
    amount: number;
    @IsString()
    @IsNotEmpty({ message: 'OrderId number is required' })
    orderId: string;
}