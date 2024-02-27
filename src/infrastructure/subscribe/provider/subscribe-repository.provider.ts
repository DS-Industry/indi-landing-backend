import {Provider} from "@nestjs/common";
import {ISubscribeRepository} from "../../../domain/subscribe/interface/subscribe-repository.interface";
import {SubscribeRepository} from "../repository/subscribe.repository";

export const SubscribeRepositoryProvider: Provider = {
    provide: ISubscribeRepository,
    useClass: SubscribeRepository,
};