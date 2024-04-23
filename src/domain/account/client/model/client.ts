import { Card } from '../../card/model/card';
import { GenderType } from '../enum/gender.enum';
import { ClientType } from '../enum/clinet-type.enum';
import { ICreateClientDto } from '../dto/create-client.dto';
import { ActivationStatusType } from '../enum/activation-status.enum';
import { ClientEntity } from '../../../../infrastructure/account/entity/client.entity';
import { CardEntity } from '../../../../infrastructure/account/entity/card.entity';
import { ShortClientDto } from '../dto/short-client.dto';
import {Password} from "../../password/model/password";
import {Subscribe} from "../../../subscribe/model/subscribe.model";
import {InfoSubscribeDto} from "../dto/info-subscribe.dto";

export class Client {
  clientId?: number;
  name: string;
  email?: string;
  phone: string;
  correctPhone: string;
  birthday?: Date;
  insDate?: Date;
  updDate?: Date;
  clientTypeId: ClientType;
  isActivated: number;
  userOnvi: number;
  activatedDate?: Date;
  genderId?: GenderType;
  refreshToken?: string;
  cards?: Card[];
  password?: Password;
  subscribe?: Subscribe;

  private constructor(
    name: string,
    rawPhone: string,
    phone: string,
    clientType: ClientType,
    refreshToken: string,
    isActivated: number,
    userOnvi: number,
    {
      clientId,
      email,
      birthday,
      cards,
      insDate,
      updDate,
      activationDate,
      genderId,
      password,
      subscribe,
    }: {
      clientId?: number;
      email?: string;
      birthday?: Date;
      cards?: Card[];
      insDate?: Date;
      updDate?: Date;
      activationDate?: Date;
      genderId?: GenderType;
      password?: Password;
      subscribe?: Subscribe;
    },
  ) {
    this.name = name;
    this.phone = rawPhone;
    this.correctPhone = phone;
    this.clientTypeId = clientType;
    this.refreshToken = refreshToken;
    this.email = email;
    this.birthday = birthday;
    this.cards = cards;
    this.insDate = insDate;
    this.isActivated = isActivated;
    this.updDate = updDate;
    this.userOnvi = userOnvi;
    this.activatedDate = activationDate;
    this.genderId = genderId;
    this.clientId = clientId
    this.password = password;
    this.subscribe = subscribe;
  }

  public static create(data: ICreateClientDto): Client {
    const { rawPhone, clientType, refreshToken, cards, password, subscribe } = data;
    const phone: string = this.formatPhone(rawPhone);
    const name: string = this.generateDefaultName(phone);
    return new Client(name, rawPhone, phone, clientType, refreshToken, 1, 1, {
      cards,
      password,
      subscribe
    });
  }

  public addCard(card: Card): void {
    if (!this.cards) this.cards = [];
    this.cards.push(card);
  }

  public addPassword(password: Password): void {
    if (!this.password) this.password = password;
  }

  public addSubscribe( subscribe: Subscribe ): void{
    if(!this.subscribe) this.subscribe = subscribe;
  }

  public getCard(): Card {
    let mainCard: Card;
    if (this.cards.length > 0) {
      const activeCards: Card[] = this.cards.filter(
        (card) => card.isDel === null || card.isDel === 0,
      );
      mainCard = activeCards.reduce((prev: Card, curr: Card) => {
        return (prev.balance ?? 0) > (curr.balance ?? 0) ? prev : curr;
      });
    } else {
      mainCard = this.cards[0];
    }

    return mainCard;
  }

  public getAccountInfo(): ShortClientDto {
    let mainCard: Card;
    if (this.cards.length > 0) {
      const activeCards: Card[] = this.cards.filter(
        (card) => card.isDel === null || card.isDel === 0,
      );
      mainCard = activeCards.reduce((prev: Card, curr: Card) => {
        return (prev.balance ?? 0) > (curr.balance ?? 0) ? prev : curr;
      });
    } else {
      mainCard = this.cards[0];
    }
    return {
      id: this.clientId,
      name: this.name,
      phone: this.correctPhone,
      email: this.email,
      birthday: this.birthday,
      refreshToken: this.refreshToken,
      cards: {
        number: mainCard.nomer,
        unqNumber: mainCard.devNomer,
        balance: mainCard.balance,
        isLocked: mainCard.isLocked,
        dateBegin: mainCard.dateBegin,
      }
    };
  }
  private static generateDefaultName(correctPhone: string): string {
    return `${correctPhone}`;
  }
  private static formatPhone(rawPhone: string): string {
    return rawPhone.replace(/^\s*\+|\s*/g, '');
  }

  public static fromEntity(entity: ClientEntity): Client {
    let cardModels;
    const {
      clientId,
      name,
      email,
      phone,
      correctPhone,
      birthday,
      insDate,
      updDate,
      clientTypeId,
      isActivated,
      userOnvi,
      activatedDate,
      genderId,
      refreshToken,
      cards,
      password,
      subscribe,
    } = entity;

    if (cards) {
      cardModels = cards.map((cardEntity: CardEntity) =>
        Card.fromEntity(cardEntity),
      );
    }

    let pasModels: Password;
    if (password) {
      pasModels = Password.fromEntity(password)
    }

    let subModel;
    if (subscribe) {
      subModel = Subscribe.fromEntity(subscribe)
    }
    const client = new Client(
      name,
      phone,
      correctPhone,
      clientTypeId,
      refreshToken,
      isActivated,
      userOnvi,
      {
        clientId,
        email,
        birthday,
        insDate,
        updDate,
        activationDate: activatedDate,
        genderId,
        cards: cardModels,
        password: pasModels,
        subscribe: subModel,
      },
    );
    return client;
  }
}
