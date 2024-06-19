import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PackEntity} from "./entity/pack.entity";
import {PackController} from "../../../api/pack/pack.controller";
import {PackRepositoryProvider} from "./provider/pack-repository.provider";
import {PackUsageEntity} from "./entity/pack-usage.entity";
import {PackUsecase} from "../../../aplication/usecases/pack/pack.usecase";
import {RemainsRepositoryProvider} from "../remains/provider/remains-repository.provider";
import {RemainsPackEntity} from "../remains/entity/remains-pack.entity";
import {AccountModule} from "../../account/account.module";

@Module({
    imports: [TypeOrmModule.forFeature([PackEntity, PackUsageEntity, RemainsPackEntity]), AccountModule],
    controllers: [PackController],
    providers: [
        PackRepositoryProvider,
        RemainsRepositoryProvider,
        PackUsecase,
    ],
    exports: [RemainsRepositoryProvider],
})
export class PackModule {}