import {AddSubscribeDto} from "../dto/add-subscribe.dto";
import {SubscribeEntity} from "../../../infrastructure/subscribe/entity/subscribe.entity";
import {Client} from "../../account/client/model/client";

export class Subscribe {
    id?: number;
    clientId?: number;
    subscribeId: string;
    createAt?: Date;
    status: string;
    dateDebiting?: Date;

    private constructor(
        subscribeId: string,
        status: string,
        {
            id,
            clientId,
            createAt,
            dateDebiting
        }: {
            id?: number;
            clientId?: number;
            createAt?: Date;
            dateDebiting?: Date;
        },
    ) {
        this.id = id;
        this.clientId = clientId;
        this.subscribeId = subscribeId;
        this.createAt = createAt;
        this.status = status;
        this.dateDebiting = dateDebiting;
    }

    public static create(data: AddSubscribeDto): Subscribe {
        const { subscribeId, clientId , status, dateDebiting} = data;
        return new Subscribe(
            subscribeId,
            status,
            {clientId, dateDebiting},
        )
    }

    public static fromEntity(entity: SubscribeEntity): Subscribe {
        const {
            id,
            client,
            subscribeId,
            createAt,
            status,
            dateDebiting,
        } = entity;

        const clientModel = Client.fromEntity(client);
        const clientId = clientModel.clientId;

        return new Subscribe(
            subscribeId,
            status,
            {id, clientId, createAt, dateDebiting},
        );
    }
}