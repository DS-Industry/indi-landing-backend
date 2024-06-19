export class CheckApplyDto{
    response:{
        razorpay_payment_id: string,
        razorpay_order_id: string,
        razorpay_signature: string,
    };
    packId: number;
    orderId: string;
}