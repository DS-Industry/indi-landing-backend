import {Card} from "../../../account/card/model/card";
import {Remains} from "../model/remains.model";

export abstract class IRemainsRepository{
    abstract create(remainsPoint: number, card: Card, burnDate?: Date): Promise<Remains>;
    abstract findOneByCardId(cardId: number): Promise<Remains>;
    abstract findBurnableByCardId(cardId: number): Promise<Remains[]>;
    abstract findOneById(remainsId: number): Promise<Remains>;
    abstract updateRemainsPoint(remainsId: number, remainsPoint: number, burnDate?: Date): Promise<Remains>;
}
