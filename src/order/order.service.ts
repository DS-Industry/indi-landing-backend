import {Injectable} from "@nestjs/common";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrderService{
    constructor(private readonly configService: ConfigService) {
    }

    async create(amount: number){
        const Razorpay = require('razorpay')
        const instance = new Razorpay({
            key_id: this.configService.get<string>('rp.key_id'),
            key_secret: this.configService.get<string>('rp.key_secret'),
        });

        const options = {
            amount: amount,
            currency: 'INR',
        };
        return new Promise((resolve, reject) => {
            instance.orders.create(options, function (err, order) {
                if (err) {
                    reject(err);
                } else {
                    resolve(order.id);
                }
            });
        });
    }
}