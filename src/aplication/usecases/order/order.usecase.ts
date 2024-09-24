import { HttpService } from '@nestjs/axios';
import {Injectable} from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import {map, Observable, Subscription} from "rxjs";
import crypto from "crypto";
import {CheckOrderDto} from "../../../api/order/dto/check-order.dto";

@Injectable()
export class OrderUsecase {
    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        ) {}

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
                    console.log('err')
                    reject(err);
                } else {
                    console.log(order)
                    resolve(order.id);
                }
            });
        });
    }

    async checkOrd(data: CheckOrderDto){
        try {
            const body = data.orderId + '|' + data.response.razorpay_payment_id;

            const crypto = require('crypto');
            const expectedSignature = crypto.createHmac('sha256', this.configService.get<string>('rp.key_secret'))
                .update(body.toString())
                .digest('hex');
            let response = {'signatureIsValid': 'false'}
            console.log('check one:' + expectedSignature)
            console.log('check two:' + data.response.razorpay_signature)
            if (expectedSignature === data.response.razorpay_signature) {
                console.log('signatureIsValid: true')
                response = {'signatureIsValid': 'true'}
                const options = this.setHeaders();
                const requestObservable: Observable<any> = this.httpService.post(
                    `${this.configService.get<string>('dsCloudUrl')}/external/mobile/write/${data.deviceId}`,
                    {
                        GVLCardNum: 0,
                        GVLCardSum: data.amount,
                        GVLSource: this.configService.get<string>('gvlSource'),
                    },
                    options
                );
                const subscription: Subscription = requestObservable.subscribe({
                    next: (response: AxiosResponse) => {
                        console.log('Response from the device to order ' + data.orderId + ': ' + response.data);
                    },
                    error: (error) => {
                        console.error('Error executing http request', error);
                    }
                });
            } else
                response = {'signatureIsValid': 'false'}
            return response
        }catch (err){
            const body = data.orderId + '|' + data.response.razorpay_payment_id;

            const crypto = require('crypto');
            const expectedSignature = crypto.createHmac('sha256', this.configService.get<string>('rp.key_secret'))
                .update(body.toString())
                .digest('hex');
            let response = {'signatureIsValid': 'false'}
            if (expectedSignature === data.response.razorpay_signature) {
                console.log('signatureIsValid: true')
                response = {'signatureIsValid': 'true'}
                const options = this.setHeaders();
                const requestObservable: Observable<any> = this.httpService.post(
                    `${this.configService.get<string>('dsCloudUrl')}/external/mobile/write/${data.deviceId}`,
                    {
                        GVLCardNum: 0,
                        GVLCardSum: data.amount,
                        GVLSource: this.configService.get<string>('gvlSource'),
                    },
                    options
                );
                const subscription: Subscription = requestObservable.subscribe({
                    next: (response: AxiosResponse) => {
                        console.log('Response from the device to order ' + data.orderId + ': ' + response.data);
                    },
                    error: (error) => {
                        console.error('Error executing http request', error);
                    }
                });
            } else
                response = {'signatureIsValid': 'false'}
            return response
        }
    }

    private setHeaders(): { headers: { akey: string } } {
        return {
            headers: {
                akey: this.configService.get<string>('dsCloudApiKey'),
            },
        };
    }
}