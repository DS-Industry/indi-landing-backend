import {AddRemainsDto} from "../dto/add-remains.dto";
import {Client} from "../../../account/client/model/client";
import {Remains} from "../model/remains.model";

export abstract class IRemainsRepository{
    abstract create(remainsPoint: number, client: Client): Promise<Remains>;
    abstract findOneByClientId(clientId: number): Promise<Remains>;
    abstract findOneById(remainsId: number): Promise<Remains>;
    abstract updateRemainsPoint(remainsId: number, remainsPoint: number): Promise<Remains>;
}