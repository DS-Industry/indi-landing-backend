import {AddPackDto} from "../dto/add-pack.dto";
import {Pack} from "../model/pack.model";
import {Client} from "../../../account/client/model/client";
import {Card} from "../../../account/card/model/card";

export abstract class IPackRepository{
    abstract create(data: AddPackDto): Promise<Pack>;
    abstract apply(pack: Pack, client: Client, card: Card, payId: string): Promise<any>;
    abstract findOneById(packId: number): Promise<Pack>;
    abstract update( pack: Pack): Promise<any>;
    abstract getAll(): Promise<Pack[]>;
}