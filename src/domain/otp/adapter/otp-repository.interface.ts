import {Otp} from "../model/otp";

export abstract class IOtpRepository {
    abstract create(otp: Otp): Promise<any>;
    abstract findOne(email: string): Promise<any>;
    abstract removeOne(email: string): Promise<any>;
    abstract send(otp: Otp): Promise<any>;
}