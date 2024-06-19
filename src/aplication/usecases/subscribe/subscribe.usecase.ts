import {Injectable} from "@nestjs/common";
import {ISubscribeRepository} from "../../../domain/subscribe/interface/subscribe-repository.interface";
import {Client} from "../../../domain/account/client/model/client";
import {CreateSubscribeDto} from "../../../api/subscribe/dto/create-subscribe.dto";
import {ConfigService} from "@nestjs/config";
import {SubscribeDto} from "./dto/subscribe.dto";
import {IAccountRepository} from "../../../domain/account/interface/account-repository.interface";
import {ReplenishmentDto} from "../../../api/subscribe/dto/replenishment.dto";
import {Observable, Subscription} from "rxjs";
import {AxiosResponse} from "axios/index";
import {CheckSubDto} from "../../../api/subscribe/dto/check-sub.dto";
import {IRemainsRepository} from "../../../domain/pack/remains/interface/remains-repository.interface";

@Injectable()
export class SubscribeUsecase {
    constructor(
        private readonly accountRepository: IAccountRepository,
        private readonly subscribeRepository: ISubscribeRepository,
        private readonly configService: ConfigService,
        private readonly remainsRepository: IRemainsRepository,
    ) {}

    async create(body: CreateSubscribeDto, client: Client): Promise<any> {
        const Razorpay = require('razorpay')
        const instance = new Razorpay({
            key_id: this.configService.get<string>('rp.key_id'),
            key_secret: this.configService.get<string>('rp.key_secret'),
        });

        const options = {
            plan_id: body.planId,
            total_count: body.totalCount
        };

        const subscribe = await instance.subscriptions.create(options);
        const oldSubscribe = await this.subscribeRepository.findOneByClient(client.clientId);
        const subscribeAdd: SubscribeDto = {
            subscribeId: subscribe.id,
            status: subscribe.status,
        }

        let newSubscribe;
        if (!oldSubscribe) {
            newSubscribe = await this.subscribeRepository.create(subscribeAdd, client);
        } else {
            await instance.subscriptions.cancel(oldSubscribe.subscribeId);
            oldSubscribe.subscribeId = subscribe.id;
            oldSubscribe.status = subscribe.status;
            newSubscribe = await this.subscribeRepository.update(oldSubscribe, client);
        }
        client.addSubscribe(newSubscribe)
        return {
            linkForPayment: subscribe.short_url,
            subId: subscribe.id,
            status: 'Success'
        }
    }

    async replenishment(subscribe: ReplenishmentDto): Promise<any>{

        const oldSubscribe = await this.subscribeRepository.findOneByIdSub(subscribe.subscribeId);
        console.log('bag ' + oldSubscribe.clientId)
        const client = await this.accountRepository.findOneClientById(oldSubscribe.clientId);
        const card = client.getCard();

        oldSubscribe.subscribeId = subscribe.subscribeId;
        oldSubscribe.status = subscribe.status;
        oldSubscribe.dateDebiting = subscribe.dateDebiting;

        await this.subscribeRepository.update(oldSubscribe, client);
        console.log("Update db: " + subscribe.subscribeId)
        const remains = await this.remainsRepository.findOneByClientId(client.clientId);
        let minusPoint = card.balance;
        if(remains){
            minusPoint = card.balance - remains.remainsPoint;
        }

        await this.accountRepository.zeroingOut(card, minusPoint);
        console.log("Zeroing out: " + card.nomer)
        let amount = subscribe.amount;
        if(subscribe.amount === 1345){
            amount = 1950;
        }
        await this.subscribeRepository.replenishment(subscribe, amount, client, card);
        console.log("Replenishment: " + card.nomer)
    }

    async cronZeroingOut(): Promise<any>{
        const subscribes = await this.subscribeRepository.findAllActive()
        for( const subscribe of subscribes){
            const client = await this.accountRepository.findOneClientById(subscribe.clientId);
            const card = client.getCard();
            subscribe.status = "closed";
            subscribe.dateDebiting = null;
            await this.subscribeRepository.update(subscribe, client);
            console.log("Change status " + subscribe.subscribeId + " closed")
            const remains = await this.remainsRepository.findOneByClientId(client.clientId);
            let minusPoint = card.balance;
            if(remains){
                minusPoint = card.balance - remains.remainsPoint;
            }

            await this.accountRepository.zeroingOut(card, minusPoint);
            console.log("Zeroing out: " + card.nomer)
        }
    }

    async getAllPlans(): Promise<any> {
        const Razorpay = require('razorpay')
        const instance = new Razorpay({
            key_id: this.configService.get<string>('rp.key_id'),
            key_secret: this.configService.get<string>('rp.key_secret'),
        });

        return instance.plans.all()
    }

    async getSubscribeInfo(client: Client){
        const subscribe = await this.subscribeRepository.findOneByClient(client.clientId);
        if(!subscribe) return null;
        const Razorpay = require('razorpay')
        const instance = new Razorpay({
            key_id: this.configService.get<string>('rp.key_id'),
            key_secret: this.configService.get<string>('rp.key_secret'),
        });
        const fullSub = await instance.subscriptions.fetch(subscribe.subscribeId);
        const plan = await instance.plans.fetch(fullSub.plan_id);
        return {
            subscribeId: subscribe.subscribeId,
            dateDebiting: subscribe.dateDebiting,
            status: subscribe.status,
            amount: plan.item.amount,
            name: plan.item.name,
            payUrl: fullSub.short_url,
        }
    }

    async cancellation(client: Client) {
        const subscribe = await this.subscribeRepository.findOneByClient(client.clientId);
        if(!subscribe) return null;
        const Razorpay = require('razorpay')
        const instance = new Razorpay({
            key_id: this.configService.get<string>('rp.key_id'),
            key_secret: this.configService.get<string>('rp.key_secret'),
        });
        await instance.subscriptions.cancel(subscribe.subscribeId);
        subscribe.status = "closed";
        await this.subscribeRepository.update(subscribe, client);
        return { status: 'Success' }
    }

    async checkSub(data: CheckSubDto){
        try {
            const body = data.response.razorpay_payment_id + '|' + data.subscriptionId;
            const crypto = require('crypto');
            const expectedSignature = crypto.createHmac('sha256', this.configService.get<string>('rp.key_secret'))
                .update(body.toString())
                .digest('hex');
            let response = {'signatureIsValid': 'false'}
            if (expectedSignature === data.response.razorpay_signature) {
                console.log('signatureIsValid: true')
                response = {'signatureIsValid': 'true'}
                const subscribe = await this.subscribeRepository.findOneByIdSub(data.subscriptionId);
                const client = await this.accountRepository.findOneClientById(subscribe.clientId);
                subscribe.status = "loading";
                await this.subscribeRepository.update(subscribe, client);
            } else
                response = {'signatureIsValid': 'false'}
            return response
        }catch (err){
            throw new Error(err);
        }
    }
}