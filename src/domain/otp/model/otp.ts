export class Otp {
    id: number;
    email: string;
    otp: string;
    createDate: Date;
    expireDate: Date;

    constructor(id: number, email: string, otp: string, expireDate: Date) {
        this.id = id;
        this.email = email;
        this.otp = otp;
        this.expireDate = expireDate;
        this.createDate = new Date(Date.now());
    }
}