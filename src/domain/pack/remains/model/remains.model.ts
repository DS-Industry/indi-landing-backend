import {AddRemainsDto} from "../dto/add-remains.dto";
import {RemainsPackEntity} from "../../../../infrastructure/pack/remains/entity/remains-pack.entity";

export class Remains {
    id?: number;
    cardId?: number;
    remainsPoint: number;
    burnDate?: Date;

    private constructor(
        remainsPoint: number,
        {
            id,
            cardId,
            burnDate,
        }: {
            id?: number;
            cardId?: number;
            burnDate?: Date;
        },
    ) {
        this.id = id;
        this.cardId = cardId;
        this.remainsPoint = remainsPoint;
        this.burnDate = burnDate;
    }

    public static create(data: AddRemainsDto): Remains {
        const { cardId, remainsPoint, burnDate } = data;
        return new Remains(
            remainsPoint,
            {cardId, burnDate},
        );
    }

    public static fromEntity(entity: RemainsPackEntity): Remains {
        const { id, card, remainsPoint, burnDate } = entity;

        return new Remains(
            remainsPoint,
            { id, cardId: card?.cardId, burnDate },
        );
    }
}
