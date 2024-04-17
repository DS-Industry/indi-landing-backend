export class CheckSubDto{
    response:{
        razorpay_payment_id: string,
        razorpay_subscription_id: string,
        razorpay_signature: string,
    };
    subscriptionId: string;
}