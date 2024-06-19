import { Injectable } from '@nestjs/common';
import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';
import { Client } from '../../../domain/account/client/model/client';
import { Card } from '../../../domain/account/card/model/card';
import { CardRepository } from './card.repository';
import { ClientRepository } from './client.repository';
import { ICreateCardDto } from '../../../domain/account/card/dto/create-card.dto';
import { ICreateClientDto } from '../../../domain/account/client/dto/create-client.dto';
import { CardType } from '../../../domain/account/card/enum/card-type.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TariffEntity } from '../entity/tariff.entity';
import { Tariff } from '../../../domain/account/card/model/tariff';
import {ICreatePasswordDto} from "../../../domain/account/password/dto/create-password.dto";
import {Password} from "../../../domain/account/password/model/password";
import {PasswordRepository} from "./password.repository";

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    @InjectRepository(TariffEntity)
    private readonly tariffRepository: Repository<TariffEntity>,
    private readonly cardRepository: CardRepository,
    private readonly clientRepository: ClientRepository,
    private readonly passwordRepository: PasswordRepository,
  ) {}

  async create(clientData: ICreateClientDto, card: Card, password: string): Promise<any> {
    const client: Client = Client.create(clientData);
    const newClient = await this.clientRepository.create(client);

    card.addClientId(client.clientId);

    const newCard = await this.cardRepository.changeClient(card.cardId, newClient);

    client.addCard(newCard);

    const pasData: ICreatePasswordDto = {
      clientId: newClient.clientId,
      password: password,
    }

    const pas: Password = Password.create(pasData);

    const newPas = await this.passwordRepository.create(pas, newClient)

    client.addPassword(newPas);

    return client;
  }
  async update(client: Client): Promise<Client> {
    return await this.clientRepository.update(client);
  }
  getBalance(cardNumber: string): Promise<Card> {
    return null;
  }

  async findCardTariff(card: Card) {
    const tariff = await this.tariffRepository.findOne({
      where: {
        cardTypeId: card.cardTypeId,
      },
    });

    if (!tariff) return null;

    return Tariff.fromEntity(tariff);
  }
  async findOneByPhoneNumber(phone: any): Promise<any> {
    //TODO
    // 1) Find customer by phone number

    const client = await this.clientRepository.findOneByPhone(phone);

    if (!client) return null;

    return client;
  }

  async findOneClientById(clientId:number): Promise<Client>{

    const client = await this.clientRepository.findOneById(clientId);

    if (!client) return null;

    return client;
  }

  async findPasswordByPhoneNumber(phone: any): Promise<any> {
    const client = await this.findOneByPhoneNumber(phone);
    const password = await this.passwordRepository.findOne(client.clientId);

    if (!password) return null;

    return password;
  }

  async findOneByDevNomer(uniqNomer: any): Promise<any> {
    //TODO
    // 1) Find customer by phone number

    const card = await this.cardRepository.findOneByDevNomer(uniqNomer);

    if (!card) return null;

    return card;
  }

  async findOneByNomer(uniqNomer: any): Promise<any> {
    //TODO
    // 1) Find customer by phone number

    const card = await this.cardRepository.findOneByNomer(uniqNomer);

    if (!card) return null;

    return card;
  }


  async changeTypeCard(cardId: number, newCardTypeId: number): Promise<any> {
    return await this.cardRepository.changeType(cardId, newCardTypeId);
  }

  async changePassword(password:Password, newPassword:string): Promise<any>{
    await this.passwordRepository.change(password, newPassword);
  }

  async setRefreshToken(phone: string, token: string): Promise<any> {
    await this.clientRepository.setRefreshToken(phone, token);
  }

  async zeroingOut(card: Card, minusPoint: number): Promise<any> {
    await this.cardRepository.zeroingOut(card, minusPoint);
  }
}
