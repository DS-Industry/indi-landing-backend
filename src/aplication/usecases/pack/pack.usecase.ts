import {Injectable} from "@nestjs/common";
import {IPackRepository} from "../../../domain/pack/pack/interface/pack-repository.interface";
import {AddPackDto} from "../../../domain/pack/pack/dto/add-pack.dto";
import {Pack} from "../../../domain/pack/pack/model/pack.model";
import {ApplyPackDto} from "../../../api/pack/dto/apply-pack.dto";
import {Client} from "../../../domain/account/client/model/client";
import Razorpay from "razorpay";
import {ConfigService} from "@nestjs/config";
import {CheckApplyDto} from "../../../api/pack/dto/check-apply.dto";
import crypto from "crypto";
import {IRemainsRepository} from "../../../domain/pack/remains/interface/remains-repository.interface";

@Injectable()
export class PackUsecase {
    constructor(
        private readonly packRepository: IPackRepository,
        private readonly configService: ConfigService,
        private readonly remainsRepository: IRemainsRepository,
    ) {}

    async create(body: AddPackDto): Promise<Pack> {
        return await this.packRepository.create(body);
    }

    async getAll(): Promise<Pack[]> {
        return await this.packRepository.getAll();
    }

    async apply(body: ApplyPackDto) {
        const pack = await this.packRepository.findOneById(body.packId);
        if(!pack) return null;

        const Razorpay = require('razorpay')
        const instance = new Razorpay({
            key_id: this.configService.get<string>('rp.key_id'),
            key_secret: this.configService.get<string>('rp.key_secret'),
        });

        const options = {
            amount: pack.sumMoney * 100,
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

    async checkApply(data: CheckApplyDto, client: Client){
        const pack = await this.packRepository.findOneById(data.packId);
        if(!pack) return null;

        const body = data.orderId + '|' + data.response.razorpay_payment_id;

        const crypto = require('crypto');
        const expectedSignature = crypto.createHmac('sha256', this.configService.get<string>('rp.key_secret'))
            .update(body.toString())
            .digest('hex');
        let response: { signatureIsValid: string; };
        if (expectedSignature === data.response.razorpay_signature) {
            response = {'signatureIsValid': 'true'}

            const remains = await this.remainsRepository.findOneByClientId(client.clientId);
            if (!remains) {
               await this.remainsRepository.create(pack.sumPoint, client);
            } else {
                const upPoint = remains.remainsPoint + pack.sumPoint;
                await this.remainsRepository.updateRemainsPoint(remains.id, upPoint);
            }

            const card = client.getCard();
            await this.packRepository.apply(pack, client, card, data.response.razorpay_payment_id);

        } else
            response = {'signatureIsValid': 'false'}
        return response
    }
}