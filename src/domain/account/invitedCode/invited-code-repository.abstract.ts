import {InvitedCode} from "./model/invitedCode";
import {Client} from "../client/model/client";

export abstract class IInvitedCodeRepository {
    abstract create(invitedCode: InvitedCode, client: Client): Promise<any>;
    abstract findOneById(id: number): Promise<any>;
    abstract findOneByClientId(clientId: number): Promise<any>;
    abstract findOneByCode(invitedCode: string): Promise<any>;
    abstract apply(invitedCode: InvitedCode, owner: Client, user: Client): Promise<void>;
    abstract findAllClientByCodeId(id: number): Promise<any>;
}