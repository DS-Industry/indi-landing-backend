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
  ) {}

  //public async isAuthenticated(phone: string) {}

  public async register(phone: string, uniqNomer: string, password: string, chPassword: string): Promise<any> {

    if(password != chPassword) {
      throw new InvalidPasswordException(phone);
    }

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

    //await this.setCurrentRefreshToken(phone, refreshToken.token);

    return { newAccount, accessToken, refreshToken };
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
