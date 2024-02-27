import {SubscribeUsecase} from "../../../aplication/usecases/subscribe/subscribe.usecase";
import {Subscribe} from "../model/subscribe.model";
import {Client} from "../../account/client/model/client";
import {SubscribeDto} from "../../../aplication/usecases/subscribe/dto/subscribe.dto";
import {Card} from "../../account/card/model/card";
import {ReplenishmentDto} from "../../../api/subscribe/dto/replenishment.dto";


export abstract class ISubscribeRepository{
    abstract create(data: SubscribeDto, client: Client): Promise<any>;
    abstract findOneByClient(clientId: number): Promise<any>;
    abstract findOneByIdSub(subscribeId: string): Promise<any>;
    abstract update(subscribe: Subscribe, client: Client): Promise<any>;
    abstract replenishment(subscribe: ReplenishmentDto, client: Client, card: Card): Promise<any>;
    abstract findAllActive(): Promise<any>;
}