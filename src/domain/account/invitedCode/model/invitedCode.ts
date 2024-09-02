import {ICreateInvitedCodeDto} from "../dto/create-invited-code.dto";
import {InvitedCodeEntity} from "../../../../infrastructure/account/entity/invitedCode.entity";

export class InvitedCode {
    id?: number;
    clientId?: number;
    invitedCode: string;
    maxInvited: number;
    pointToOwner: number;
    pointToUser: number;
    createAt?: Date;

    private constructor(
        invitedCode: string,
        maxInvited: number,
        pointToOwner: number,
        pointToUser: number,
        {
            id,
            clientId,
            createAt,
        }: {
            id?: number;
            clientId?: number;
            createAt?: Date;
        },
    ) {
        this.id = id;
        this.clientId = clientId;
        this.invitedCode = invitedCode;
        this.maxInvited = maxInvited;
        this.pointToOwner = pointToOwner;
        this.pointToUser = pointToUser;
        this.createAt = createAt;
    }

    public static create(data: ICreateInvitedCodeDto) : InvitedCode {
        const { clientId, invitedCode, maxInvited, pointToOwner, pointToUser} = data;
        return new InvitedCode(
            invitedCode,
            maxInvited,
            pointToOwner,
            pointToUser,
            { clientId },
        )
    }

    public static fromEntity(entity: InvitedCodeEntity): InvitedCode {
        const {
            id,
            client,
            invitedCode,
            maxInvited,
            pointToOwner,
            pointToUser,
            createAt,
        } = entity;

        const clientId = client.clientId;

        return new InvitedCode(
            invitedCode,
            maxInvited,
            pointToOwner,
            pointToUser,
            {id, clientId, createAt}
        );
    }
}