import { Card } from '../card/model/card';
import { Client } from '../client/model/client';
import { ICreateClientDto } from '../client/dto/create-client.dto';
import { Tariff } from '../card/model/tariff';
import {Password} from "../password/model/password";

export abstract class IAccountRepository {
  abstract create(
    clientData: ICreateClientDto,
    card: Card,
    password: string,
  ): Promise<any>;
  abstract update(client: Client): Promise<any>;
  abstract findOneByPhoneNumber(phone: string): Promise<any>;
  abstract findOneClientById(clientId: number): Promise<Client>;
  abstract findOneByDevNomer(uniqNomer: string): Promise<any>;
  abstract findOneByNomer(uniqNomer: string): Promise<any>;
  abstract findPasswordByPhoneNumber(phone: string): Promise<any>;
  abstract changeTypeCard(cardId: number, newCardTypeId: number): Promise<any>;
  abstract changePassword(password: Password, newPassword: string): Promise<any>;
  abstract setRefreshToken(phone: string, token: string): Promise<any>;
  abstract findCardTariff(card: Card): Promise<Tariff>;
  abstract zeroingOut(card: Card, minusPoint: number): Promise<any>;
  abstract getInvitedCode(client: Client): Promise<any>;
  abstract applyInvitedCode(invitedCode: string, phoneClient: string): Promise<any>;
  abstract checkInvitedCode(invitedCode: string): Promise<any>;
  abstract getAllInviteUsageClientByCodeId(id: number): Promise<any>;
}
