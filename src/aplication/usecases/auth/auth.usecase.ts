import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';
import { Injectable } from '@nestjs/common';
import {
  IJwtService,
  IJwtServicePayload,
} from '../../../domain/auth/adapters/jwt.interface';
import { IDate } from '../../../infrastructure/common/interfaces/date.interface';
import { IJwtConfig } from '../../../domain/config/jwt-config.interface';
import { IBcrypt } from '../../../domain/auth/adapters/bcrypt.interface';
import { ClientType } from '../../../domain/account/client/enum/clinet-type.enum';
import { InvalidPasswordException } from '../../../domain/auth/exceptions/invalid-password.exception';
import { AccountExistsException } from '../../../domain/account/exceptions/account-exists.exception';
import { InvalidRefreshException } from '../../../domain/auth/exceptions/invalid-refresh.exception';
import ms = require('ms');
import { ICreateClientDto } from '../../../domain/account/client/dto/create-client.dto';
import { InvalidAccessException } from '../../../domain/auth/exceptions/invalida-token.excpetion';
import * as otpGenerator from 'otp-generator';
import {CardNotFoundExceptions} from "../../../domain/account/exceptions/card-not-found.exceptions";
import {CardHasClientExceptions} from "../../../domain/account/exceptions/card-has-client.exception";
import {IOtpRepository} from "../../../domain/otp/adapter/otp-repository.interface";
import {Otp} from "../../../domain/otp/model/otp";
import {OtpInternalExceptions} from "../../../domain/otp/exceptions/otp-internal.exceptions";
import {EmailExistsException} from "../../../domain/account/exceptions/email-exist.exception";
import {InvalidOtpException} from "../../../domain/auth/exceptions/invalid-otp.exception";
import {OTP_EXPIRY_TIME} from "../../../infrastructure/common/constants/constants";
import {AccountNotFoundExceptions} from "../../../domain/account/exceptions/account-not-found.exceptions";

@Injectable()
export class AuthUsecase {
  /*
        TODO
          1) Update jwt and refresh secret, expiry date [Completed]
          2) Convert ClientEntity --> Client domain [Completed]
          3) Add login time
          4) Complete setRefresh token [Completed]
          5) Add bycrypt to hash refresh token.  [Completed]
          6) Add response serialization [Completed]
          7) Add excepiton filter [Completed]
          8)
     */
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly jwtService: IJwtService,
    private readonly jwtConfig: IJwtConfig,
    private readonly bcryptService: IBcrypt,
    private readonly otpRepository: IOtpRepository,
    private readonly dateService: IDate,
  ) {}

  //public async isAuthenticated(phone: string) {}

  public async register(phone: string, email: string, uniqNomer: string, password: string, chPassword: string, otp:string, invitedCode: string): Promise<any> {

    const currentOtp = await this.otpRepository.findOneEmail(email);

    if (
        !currentOtp ||
        this.dateService.isExpired(currentOtp.expireDate, OTP_EXPIRY_TIME) ||
        currentOtp.otp != otp
    ) {
      throw new InvalidOtpException(phone);
    }

    if(password != chPassword) {
      throw new InvalidPasswordException(phone);
    }
    const card = await this.accountRepository.findOneByNomer(uniqNomer);
    if (card.clientId) {
      throw new InvalidOtpException(uniqNomer);
    }
    //Generate token
    const accessToken = await this.signAccessToken(phone);
    const refreshToken = await this.signRefreshToken(phone);
    const hashPassword = await this.bcryptService.hash(password)

    // Create new client model

    const clientData: ICreateClientDto = {
      rawPhone: phone,
      clientType: ClientType.INDIVIDUAL,
      refreshToken: refreshToken.token,
    };

    //Create card in the database
    const newAccount = await this.accountRepository.create(
      clientData,
      card,
      hashPassword,
    );

    await this.otpRepository.changeReg(currentOtp);

    if (invitedCode) {
      await this.accountRepository.applyInvitedCode(invitedCode, phone);
    }

    //await this.setCurrentRefreshToken(phone, refreshToken.token);

    return { newAccount, accessToken, refreshToken };
  }

  public async changePassword(phone: string, password: string, chPassword: string, otp: string){
    const currentOtp = await this.otpRepository.findOnePhone(phone);

    if (
        !currentOtp ||
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

  public async validateUserForLocalStrategy(
    phone: string,
    password: string,
  ): Promise<any> {
    const currentPassword = await this.accountRepository.findPasswordByPhoneNumber(phone);
    const checkPassword = await this.bcryptService.compare(password, currentPassword.password)

    if (
        !currentPassword ||
        !checkPassword
    ) {
      throw new InvalidPasswordException(phone);
    }

    const account = await this.accountRepository.findOneByPhoneNumber(phone);

    if (!account) {
      return null;
    }

    return account;
  }

  public async validateUserForJwtStrategy(phone: string): Promise<any> {
    const account = await this.accountRepository.findOneByPhoneNumber(phone);
    if (!account) {
      throw new InvalidAccessException(phone);
    }
    return account;
  }

  public async signAccessToken(phone: any) {
    const payload: IJwtServicePayload = { phone: phone };
    const secret = this.jwtConfig.getJwtSecret();
    const expiresIn = this.jwtConfig.getJwtExpirationTime();
    const token = this.jwtService.signToken(payload, secret, expiresIn);
    const expirationDate = new Date(
      new Date().getTime() + Math.floor(ms(expiresIn) / 1000) * 1000,
    ).toISOString();
    return { token, expirationDate };
  }

  public async signRefreshToken(phone: any) {
    const payload: IJwtServicePayload = { phone: phone };
    const secret = this.jwtConfig.getJwtRefreshSecret();
    const expiresIn = this.jwtConfig.getJwtRefreshExpirationTime();
    const token = this.jwtService.signToken(payload, secret, expiresIn);
    const expirationDate = new Date(
      new Date().getTime() + Math.floor(ms(expiresIn) / 1000) * 1000,
    ).toISOString();

    return { token, expirationDate };
  }

  public async setCurrentRefreshToken(
    phone: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await this.bcryptService.hash(refreshToken);
    await this.accountRepository.setRefreshToken(phone, hashedRefreshToken);
  }

  public async getAccountIfRefreshTokenMatches(
    refreshToken: string,
    phone: string,
  ) {
    const account = await this.accountRepository.findOneByPhoneNumber(phone);
    if (!account) {
      return null;
    }

    const isRefreshingTokenMatching = await this.bcryptService.compare(
      refreshToken,
      account.refreshToken,
    );

    if (isRefreshingTokenMatching) {
      return account;
    }

    throw new InvalidRefreshException(phone);
  }

  private formatPhone(phone): string {
    return phone.replace(/^\s*\+|\s*/g, '');
  }

  public async regOtp(email: string, phone: string, uniqNomer: string, invitedCode: string): Promise<any> {

    const card = await this.accountRepository.findOneByNomer(uniqNomer);
    if(!card){
      throw new CardNotFoundExceptions(uniqNomer);
    }
    if(card.clientId !== null && card.clientId !== undefined){
      throw new CardHasClientExceptions(uniqNomer);
    }
    //Check if user already exists
    const account = await this.accountRepository.findOneByPhoneNumber(phone);
    if (account) {
      throw new AccountExistsException(phone);
    }

    const accountEmail = await this.otpRepository.findOneEmail(email)
    if (accountEmail && accountEmail.registration == 1){
      throw new EmailExistsException(email);
    }

    if (invitedCode) {
      await this.accountRepository.checkInvitedCode(invitedCode);
    }

    return await this.sendOtp(email, phone, 0);
  }

  public async changePasswordOtp(phone: string): Promise<any> {
    const otp = await this.otpRepository.findOnePhone(phone);
    if(!otp || otp.registration == 0){
      throw new AccountNotFoundExceptions(phone);
    }
    return await this.sendOtp(otp.email, otp.phone, 1);
  }

  private async sendOtp(email: string, phone: string, reg: number): Promise<any> {

    const otpTime = this.dateService.generateOtpTime();
    const otpCode = this.generateOtp();
    const otp = new Otp(null, email, phone, otpCode, otpTime, reg);
    await this.otpRepository.removeOne(email);
    const newOtp = await this.otpRepository.create(otp);
    await this.otpRepository.send(newOtp);

    if (!newOtp) {
      throw new OtpInternalExceptions(email, otp.otp);
    }

    return newOtp;
  }

  private generateOtp() {
    return otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
  }

  private async generateNomerCard() {
    let newNomer = '';
    do {
      newNomer = this.generateRandom12DigitNumber();
      console.log(newNomer);
    } while (await this.accountRepository.findOneByDevNomer(newNomer));
    return newNomer;
  }
  private generateRandom12DigitNumber() {
    const min = 100000000000; // Минимальное 12-значное число
    const max = 999999999999; // Максимальное 12-значное число
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber.toString(); // Преобразование числа в строку
  }
}
