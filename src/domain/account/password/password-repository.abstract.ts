import {Password} from "./model/password";
import {Client} from "../client/model/client";

export abstract class IPasswordRepository {
    abstract create(password: Password, client: Client): Promise<any>;
    abstract findOne(clientId: number): Promise<any>;
    abstract change(password: Password, newPassword: string): Promise<void>;
}
