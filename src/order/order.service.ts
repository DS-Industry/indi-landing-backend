import { HttpService } from '@nestjs/axios';
import {Injectable} from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import {map} from "rxjs";

@Injectable()
export class OrderService{
    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,) {
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

    async check(data: any){
        const body = data.response.razorpay_order_id + '|' + data.response.razorpay_payment_id;
        console.log(body)

        const crypto = require('crypto');
        const expectedSignature = crypto.createHmac('sha256', this.configService.get<string>('rp.key_secret'))
            .update(body.toString())
            .digest('hex');
        console.log('sig received', data.response.razorpay_signature);
        console.log('sig generated', expectedSignature);
        console.log(data.deviceId);
        console.log(data.amount);
        let response = {'signatureIsValid':'false'}
        if(expectedSignature === data.response.razorpay_signature) {
            response = {'signatureIsValid': 'true'}
            const options = this.setHeaders();
            this.httpService
                .post(
                `${this.configService.get<string>('dsCloudUrl')}/external/mobile/write/${data.deviceId}`,
                    {
                        GVLCardNum: 0,
                        GVLCardSum: data.amount,
                        GVLSource: this.configService.get<string>('gvlSource'),
                    },
                    options,
            ).pipe(
                map((axiosResponse: AxiosResponse) => {
                    return axiosResponse.data;
                }),
            );
        }else
            response= {'signatureIsValid':'false'}
        return response
    }

    private setHeaders(): { headers: { akey: string } } {
        return {
            headers: {
                akey: this.configService.get<string>('dsCloudApiKey'),
            },
        };
    }
}