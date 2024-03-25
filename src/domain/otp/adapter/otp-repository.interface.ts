import {Otp} from "../model/otp";

export abstract class IOtpRepository {
    abstract create(otp: Otp): Promise<any>;
    abstract findOneEmail(email: string): Promise<any>;
    abstract findOnePhone(phone: string): Promise<any>;
    abstract removeOne(email: string): Promise<any>;
    abstract send(otp: Otp): Promise<any>;
    abstract changeReg(otp: Otp): Promise<any>;
}