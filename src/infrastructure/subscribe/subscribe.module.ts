import {Module} from "@nestjs/common";
import {SubscribeController} from "../../api/subscribe/subscribe.controller";
import {SubscribeUsecase} from "../../aplication/usecases/subscribe/subscribe.usecase";
import {SubscribeRepositoryProvider} from "./provider/subscribe-repository.provider";
import {SubscribeRepository} from "./repository/subscribe.repository";
import {TypeOrmModule} from "@nestjs/typeorm";
import {CardEntity} from "../account/entity/card.entity";
import {ClientEntity} from "../account/entity/client.entity";
import {TariffEntity} from "../account/entity/tariff.entity";
import {PasswordEntity} from "../account/entity/password.entity";
import {SubscribeEntity} from "./entity/subscribe.entity";
import {AccountModule} from "../account/account.module";

@Module({
    imports:[
        TypeOrmModule.forFeature([SubscribeEntity]),
        AccountModule,
    ],
    controllers:[SubscribeController],
    providers:[SubscribeUsecase, SubscribeRepository, SubscribeRepositoryProvider],
    exports:[SubscribeRepositoryProvider, SubscribeUsecase]
})
export class SubscribeModule{}