import {AddRemainsDto} from "../dto/add-remains.dto";
import {RemainsPackEntity} from "../../../../infrastructure/pack/remains/entity/remains-pack.entity";
import {Client} from "../../../account/client/model/client";

export class Remains {
    id?: number;
    clientId?: number;
    remainsPoint: number;

    private constructor(
        remainsPoint: number,
        {
            id,
            clientId
        }: {
            id?: number;
            clientId?: number;
        },
    ) {
        this.id = id;
        this.clientId = clientId;
        this.remainsPoint = remainsPoint;
    }

    public static create(data: AddRemainsDto): Remains {
        const { clientId, remainsPoint } = data;
        return new Remains(
            remainsPoint,
            {clientId},
        );
    }

    public static fromEntity(entity: RemainsPackEntity): Remains {
        const { id, client, remainsPoint, } = entity;

        const clientModel = Client.fromEntity(client);
        const clientId = clientModel.clientId;

        return new Remains(
            remainsPoint,
            { id, clientId },
        );
    }
}