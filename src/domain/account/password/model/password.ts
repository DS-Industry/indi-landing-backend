import {ICreatePasswordDto} from "../dto/create-password.dto";
import {PasswordEntity} from "../../../../infrastructure/account/entity/password.entity";

export class Password {
    id?: number;
    password: string;
    clientId?: number;

    private constructor(
        password: string,
        {
            id,
            clientId,
        }: {
            id?: number;
            clientId?: number;
        },
    ) {
        this.id = id;
        this.password = password;
        this.clientId = clientId;
    }

    public static create(data: ICreatePasswordDto): Password {
        const { clientId, password} = data;
        return new Password(
            password,
            { clientId },
        );
    }

    public static fromEntity(entity: PasswordEntity): Password {
        const {
            id,
            client,
            password,
        } = entity;

        const pas = new Password(
            password,
            {
                id,
            },
        );
        return pas;
    }
}
