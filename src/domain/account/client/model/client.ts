import { Card } from '../../card/model/card';
import { GenderType } from '../enum/gender.enum';
import { ClientType } from '../enum/clinet-type.enum';
import { ICreateClientDto } from '../dto/create-client.dto';
import { ClientEntity } from '../../../../infrastructure/account/entity/client.entity';
import { CardEntity } from '../../../../infrastructure/account/entity/card.entity';
import { ShortClientDto } from '../dto/short-client.dto';
import { Password } from "../../password/model/password";
import { Subscribe } from "../../../subscribe/model/subscribe.model";

export type ClientStatus = 'ACTIVE' | 'BLOCKED' | 'DELETED' | 'VERIFICATE';

export class Client {
  clientId?: number;
  name: string;
  email?: string;
  phone: string;
  birthday?: Date;
  insDate?: Date;
  updDate?: Date;
  clientTypeId: ClientType;
  status: ClientStatus;
  genderId?: GenderType;
  refreshToken?: string;
  cards?: Card[];
  password?: Password;
  subscribe?: Subscribe;
  invitedFriends?: string[];

  private constructor(
    name: string,
    phone: string,
    clientType: ClientType,
    refreshToken: string,
    status: ClientStatus,
    {
      clientId,
      email,
      birthday,
      cards,
      insDate,
      updDate,
      genderId,
      password,
      subscribe,
      invitedFriends
    }: {
      clientId?: number;
      email?: string;
      birthday?: Date;
      cards?: Card[];
      insDate?: Date;
      updDate?: Date;
      genderId?: GenderType;
      password?: Password;
      subscribe?: Subscribe;
      invitedFriends?: string[]
    },
  ) {
    this.name = name;
    this.phone = phone;
    this.clientTypeId = clientType;
    this.refreshToken = refreshToken;
    this.email = email;
    this.birthday = birthday;
    this.cards = cards;
    this.insDate = insDate;
    this.status = status;
    this.updDate = updDate;
    this.genderId = genderId;
    this.clientId = clientId;
    this.password = password;
    this.subscribe = subscribe;
    this.invitedFriends = invitedFriends;
  }

  public static create(data: ICreateClientDto): Client {
    const { rawPhone, clientType, refreshToken, cards, password, subscribe } = data;
    const phone = this.formatPhone(rawPhone);
    const name = this.generateDefaultName(phone);
    return new Client(name, phone, clientType, refreshToken, 'ACTIVE', {
      cards,
      password,
      subscribe
    });
  }

  private static formatPhone(rawPhone: string): string {
    return rawPhone.replace(/^\s*\+|\s*/g, '');
  }

  private static generateDefaultName(phone: string): string {
    return phone;
  }

  public addCard(card: Card): void {
    if (!this.cards) this.cards = [];
    this.cards.push(card);
  }

  public addPassword(password: Password): void {
    if (!this.password) this.password = password;
  }

  public addSubscribe(subscribe: Subscribe): void {
    if (!this.subscribe) this.subscribe = subscribe;
  }

  public getCard(): Card | undefined {
    if (!this.cards?.length) return undefined;
    const activeCards = this.cards.filter(card => !card.isDeleted());
    if (activeCards.length === 0) return this.cards[0];
    return activeCards.reduce((prev, curr) =>
      (prev.balance ?? 0) > (curr.balance ?? 0) ? prev : curr
    );
  }

  public getAccountInfo(): ShortClientDto {
    const mainCard = this.getCard();
    if (!mainCard) {
      throw new Error('У клиента нет активных карт');
    }
    return {
      id: this.clientId!,
      name: this.name,
      phone: this.phone,
      email: this.email ?? '',
      birthday: this.birthday,
      refreshToken: this.refreshToken ?? '',
      invitedFriends: this.invitedFriends ?? [],
      cards: {
        number: mainCard.nomer,
        unqNumber: mainCard.devNomer,
        balance: mainCard.balance,
        isLocked: mainCard.isLocked,
        dateBegin: mainCard.dateBegin,
      }
    };
  }

  public static fromEntity(entity: ClientEntity): Client {
    const {
      clientId,
      name,
      email,
      phone,
      birthday,
      insDate,
      updDate,
      contractType,
      status,
      genderId,
      refreshToken,
      cards,
      password,
      subscribe,
    } = entity;

    const clientTypeId: ClientType = contractType === 'CORPORATE' ? ClientType.CORPORATE : ClientType.INDIVIDUAL;

    const cardModels = cards?.map(cardEntity => Card.fromEntity(cardEntity));
    const passwordModel = password ? Password.fromEntity(password) : undefined;
    const subscribeModel = subscribe ? Subscribe.fromEntity(subscribe) : undefined;

    return new Client(
      name,
      phone,
      clientTypeId,
      refreshToken,
      status as ClientStatus,
      {
        clientId,
        email,
        birthday,
        insDate,
        updDate,
        genderId,
        cards: cardModels,
        password: passwordModel,
        subscribe: subscribeModel,
      },
    );
  }
}
