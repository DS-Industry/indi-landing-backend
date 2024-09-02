import { Injectable } from '@nestjs/common';
import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';
import { IDate } from '../../../infrastructure/common/interfaces/date.interface';
import { Client } from '../../../domain/account/client/model/client';
import { AccountNotFoundExceptions } from '../../../domain/account/exceptions/account-not-found.exceptions';
import { TariffResponseDto } from './dto/tariff-response.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import {Otp} from "../../../domain/otp/model/otp";
import {OtpInternalExceptions} from "../../../domain/otp/exceptions/otp-internal.exceptions";
import {AuthUsecase} from "../auth/auth.usecase";
import {IOtpRepository} from "../../../domain/otp/adapter/otp-repository.interface";
import * as otpGenerator from "otp-generator";
import {OTP_EXPIRY_TIME} from "../../../infrastructure/common/constants/constants";
import {InvalidOtpException} from "../../../domain/auth/exceptions/invalid-otp.exception";
import {InvalidPasswordException} from "../../../domain/auth/exceptions/invalid-password.exception";
import {IBcrypt} from "../../../domain/auth/adapters/bcrypt.interface";

@Injectable()
export class AccountUsecase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly otpRepository: IOtpRepository,
    private readonly dateService: IDate,
    private readonly bcryptService: IBcrypt,
  ) {}

  async getCardTariff(client: Client): Promise<TariffResponseDto> {
    const card = client.getCard();
    const tariff = await this.accountRepository.findCardTariff(card);

    if (!tariff) throw new AccountNotFoundExceptions(client.correctPhone);

    return {
      cashBack: tariff.bonus,
    };
  }

  async getEmail(client: Client): Promise<string> {
    const otp = await this.otpRepository.findOnePhone(client.phone);
    return otp.email;
  }

  async updateAccountInfo(body: UpdateAccountDto, client: Client) {
    const { name, email } = body;

    client.name = name ? name : client.name;
    client.email = email ? email : client.email;

    const updatedClient = await this.accountRepository.update(client);

    if (!updatedClient)
      throw new AccountNotFoundExceptions(client.correctPhone);

    return updatedClient;
  }

  public async changePassword(client: Client, password: string, chPassword: string, otp: string){
    const phone = client.phone;
    const currentOtp = await this.otpRepository.findOnePhone(phone);

    if (
        this.dateService.isExpired(currentOtp.expireDate, OTP_EXPIRY_TIME) ||
        currentOtp.otp != otp
    ) {
      throw new InvalidOtpException(phone);
    }

    if(password != chPassword) {
      throw new InvalidPasswordException(phone);
    }

    const oldPassword = await this.accountRepository.findPasswordByPhoneNumber(phone);
    const hashPassword = await this.bcryptService.hash(password);
    await this.accountRepository.changePassword(oldPassword, hashPassword);
  }

  public async changePasswordOtp(client: Client): Promise<any> {
    const phone = client.phone;
    const otp = await this.otpRepository.findOnePhone(phone);

    return await this.sendOtp(otp.email, otp.phone);
  }

  private async sendOtp(email: string, phone: string): Promise<any> {

    const otpTime = this.dateService.generateOtpTime();
    const otpCode = this.generateOtp();
    const otp = new Otp(null, email, phone, otpCode, otpTime, 1);
    await this.otpRepository.removeOne(email);
    const newOtp = await this.otpRepository.create(otp);
    await this.otpRepository.send(newOtp);

    if (!newOtp) {
      throw new OtpInternalExceptions(email, otp.otp);
    }

    return newOtp;
  }

  public async getInvitedCode(client: Client): Promise<any> {
    return await this.accountRepository.getInvitedCode(client);
  }

  public async getAllInviteUsageClientByCodeId(client: Client): Promise<any>{
    const inviteCode = await this.accountRepository.getInvitedCode(client);
    const clients = await this.accountRepository.getAllInviteUsageClientByCodeId(inviteCode.id);

    return clients.map((client: Client) => client.name);
  }

  private generateOtp() {
    return otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
  }
}
