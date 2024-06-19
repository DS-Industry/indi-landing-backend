import {Provider} from "@nestjs/common";
import {IRemainsRepository} from "../../../../domain/pack/remains/interface/remains-repository.interface";
import {RemainsRepository} from "../repository/remains.repository";

export const RemainsRepositoryProvider: Provider = {
    provide: IRemainsRepository,
    useClass: RemainsRepository,
};