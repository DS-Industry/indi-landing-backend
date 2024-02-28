import {Injectable} from "@nestjs/common";
import {ISubscribeRepository} from "../../../domain/subscribe/interface/subscribe-repository.interface";
import {Client} from "../../../domain/account/client/model/client";
import {CreateSubscribeDto} from "../../../api/subscribe/dto/create-subscribe.dto";
import Razorpay from "razorpay";
import {ConfigService} from "@nestjs/config";
import {Subscribe} from "../../../domain/subscribe/model/subscribe.model";
import {SubscribeDto} from "./dto/subscribe.dto";
import {IAccountRepository} from "../../../domain/account/interface/account-repository.interface";
import {ReplenishmentDto} from "../../../api/subscribe/dto/replenishment.dto";

@Injectable()
export class SubscribeUsecase {
    constructor(
        private readonly accountRepository: IAccountRepository,
        private readonly subscribeRepository: ISubscribeRepository,
        private readonly configService: ConfigService,
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

        if(!oldSubscribe) {
            await this.subscribeRepository.create(subscribeAdd, client);
        } else {
            await instance.subscriptions.cancel(oldSubscribe.subscribeId);
            oldSubscribe.subscribeId = subscribe.id;
            oldSubscribe.status = subscribe.status;
            await this.subscribeRepository.update(oldSubscribe, client);
        }
        return {
            linkForPayment: subscribe.short_url,
            status: 'Success'
        }
    }

    async replenishment(subscribe: ReplenishmentDto): Promise<any>{

        const oldSubscribe = await this.subscribeRepository.findOneByIdSub(subscribe.subscribeId);
        const client = await this.accountRepository.findOneClientById(oldSubscribe.clientId);
        const card = client.getCard();

        oldSubscribe.subscribeId = subscribe.subscribeId;
        oldSubscribe.status = subscribe.status;
        oldSubscribe.dateDebiting = subscribe.dateDebiting;

        await this.subscribeRepository.update(oldSubscribe, client);
        console.log("Update db: " + subscribe.subscribeId)
        await this.accountRepository.zeroingOut(card.cardId);
        console.log("Zeroing out: " + card.nomer)
        await this.subscribeRepository.replenishment(subscribe, client, card);
        console.log("Replenishment: " + card.nomer)
    }

    async cronZeroingOut(): Promise<any>{
        const subscribes = await this.subscribeRepository.findAllActive()
        for( const subscribe of subscribes){
            const client = await this.accountRepository.findOneClientById(subscribe.clientId);
            subscribe.status = "closed";
            subscribe.dateDebiting = null;
            await this.subscribeRepository.update(subscribe, client);
            console.log("Change status " + subscribe.subscribeId + " closed")
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
}