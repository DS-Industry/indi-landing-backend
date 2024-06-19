import {Provider} from "@nestjs/common";
import {IPackRepository} from "../../../../domain/pack/pack/interface/pack-repository.interface";
import {PackRepository} from "../repository/pack.repository";

export const PackRepositoryProvider: Provider = {
    provide: IPackRepository,
    useClass: PackRepository,
}