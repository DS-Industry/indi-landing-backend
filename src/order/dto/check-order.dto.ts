export class CheckOrderDto{
    response:{
        razorpay_payment_id: string,
        razorpay_order_id: string,
        razorpay_signature: string,
    };
    deviceId: number;
    amount: number;
    orderId: string;
}