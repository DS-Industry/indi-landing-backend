export class Otp {
    id: number;
    email: string;
    phone: string;
    otp: string;
    createDate: Date;
    expireDate: Date;
    registration: number;

    constructor(id: number, email: string, phone: string, otp: string, expireDate: Date, registration: number) {
        this.id = id;
        this.email = email;
        this.phone = phone;
        this.otp = otp;
        this.expireDate = expireDate;
        this.createDate = new Date(Date.now());
        this.registration = registration;
    }
}