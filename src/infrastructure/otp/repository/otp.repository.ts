import {Injectable} from "@nestjs/common";
import {IOtpRepository} from "../../../domain/otp/adapter/otp-repository.interface";
import {Otp} from "../../../domain/otp/model/otp";
import {InjectRepository} from "@nestjs/typeorm";
import {OtpEntity} from "../entity/otp.entity";
import {Repository} from "typeorm";
import {HttpService} from "@nestjs/axios";

@Injectable()
export class OtpRepository implements IOtpRepository{
    constructor(
        @InjectRepository(OtpEntity)
        private readonly otpRepository: Repository<OtpEntity>,
        private readonly httpService: HttpService,
    ) {
    }
    async create(otp: Otp): Promise<any> {
        const otpEntity = this.toOtpEntity(otp);
        const newOtpEntity = await this.otpRepository.save(otpEntity);
        const newOtp = this.toOtp(newOtpEntity);
        return newOtp;
    }

    async findOne(email: string): Promise<any> {
        return await this.otpRepository.findOne({ where: { email: email } });
    }

    async removeOne(email: string): Promise<any> {
        await this.otpRepository.delete({ email: email});
    }

    send(otp: Otp): Promise<any> {
        return Promise.resolve(undefined);
    }

    private toOtp(otpEntity: OtpEntity): Otp {
        const otp = new Otp(
            otpEntity.id,
            otpEntity.email,
            otpEntity.otp,
            otpEntity.expireDate,
        );

        return otp;
    }

    private toOtpEntity(otp: Otp): OtpEntity {
        const otpEntity = new OtpEntity();

        otpEntity.otp = otp.otp;
        otpEntity.email = otp.email;
        otpEntity.expireDate = otp.expireDate;

        return otpEntity;
    }
}