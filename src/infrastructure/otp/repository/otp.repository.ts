import {Injectable} from "@nestjs/common";
import {IOtpRepository} from "../../../domain/otp/adapter/otp-repository.interface";
import {Otp} from "../../../domain/otp/model/otp";
import {InjectRepository} from "@nestjs/typeorm";
import {OtpEntity} from "../entity/otp.entity";
import {Repository} from "typeorm";
import {HttpService} from "@nestjs/axios";
import {ConfigService} from "@nestjs/config";
import {map} from "rxjs/operators";
import {AxiosResponse} from "axios";
import {AuthentificationException} from "../../../domain/otp/exceptions/authentification.exception";

@Injectable()
export class OtpRepository implements IOtpRepository{
    private readonly emailApiKey: string;
    private readonly emailUrl: string;
    private readonly emailName: string;
    private readonly emailFrom: string;
        constructor(
        @InjectRepository(OtpEntity)
        private readonly otpRepository: Repository<OtpEntity>,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.emailApiKey = this.configService.get<string>('emailApiKey');
        this.emailUrl = this.configService.get<string>('emailUrl');
        this.emailName = this.configService.get<string>('emailName');
        this.emailFrom = this.configService.get<string>('emailFrom');
    }
    async create(otp: Otp): Promise<any> {
        const otpEntity = this.toOtpEntity(otp);
        const newOtpEntity = await this.otpRepository.save(otpEntity);
        return this.toOtp(newOtpEntity);
    }

    async findOneEmail(email: string): Promise<any> {
        return await this.otpRepository.findOne({ where: { email: email } });
    }

    async findOnePhone(phone: string): Promise<any> {
        return await this.otpRepository.findOne({ where: { phone: phone } });
    }

    async changeReg(otp: Otp): Promise<any> {
        otp.registration = 1;
        await this.otpRepository.save(otp);
    }

    async removeOne(email: string): Promise<any> {
        await this.otpRepository.delete({ email: email});
    }

    async send(otp: Otp): Promise<any> {
        const header: any = this.setHeaders();
        const params = this.setParams(otp.email, otp.otp);
        try {
            return this.httpService
                .post(this.emailUrl, params, header)
                .pipe(
                    map((axiosResponse: AxiosResponse) => {
                        return { message: 'Success', to: otp.email };
                    }),
                )
                .subscribe((result) => {
                    console.log(result); // Здесь выведется результат операции map
                });
        } catch (e) {
            throw new AuthentificationException([
                `Error sending otp to ${otp.phone}`,
            ]);
        }
    }

    private toOtp(otpEntity: OtpEntity): Otp {
        return new Otp(
            otpEntity.id,
            otpEntity.email,
            otpEntity.phone,
            otpEntity.otp,
            otpEntity.expireDate,
            otpEntity.registration,
        );
    }

    private toOtpEntity(otp: Otp): OtpEntity {
        const otpEntity = new OtpEntity();

        otpEntity.otp = otp.otp;
        otpEntity.email = otp.email;
        otpEntity.phone = otp.phone;
        otpEntity.expireDate = otp.expireDate;
        otpEntity.registration = otp.registration;

        return otpEntity;
    }

    private setParams(email: string, otp: string) {
        const params = new FormData();
        params.append('name', `${this.emailName}`)
        params.append('from', `${this.emailFrom}`)
        params.append('subject', 'Verification code')
        params.append('to', `${email}`)
        params.append('html', `<html><head></head><body><p>Your verification code: <b>${otp}</b></p></body></html>`)

        return params;
    }

    private setHeaders(): {
        headers: { Authorization: string; 'content-type': string };
    } {
        return {
            headers: {
                Authorization: this.emailApiKey,
                'content-type': 'multipart/form-data',
            },
        };
    }
}