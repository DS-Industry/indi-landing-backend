import { CardEntity } from '../../../../infrastructure/account/entity/card.entity';
import { ICreateCardDto } from '../dto/create-card.dto';

export type CardStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';
export type CardType = 'VIRTUAL' | 'PHYSICAL';

export class Card {
  cardId?: number;
  balance: number;
  status: CardStatus;
  cardType: CardType;
  dateBegin: Date;
  clientId?: number;
  devNomer: string;
  nomer: string;
  monthLimit: number | null;
  cardTierId: number | null;

  private constructor(
    cardType: CardType,
    nomer: string,
    devNomer: string,
    balance: number,
    dateBegin: Date,
    {
      cardId,
      clientId,
      status,
      monthLimit,
      cardTierId,
    }: {
      cardId?: number;
      clientId?: number;
      status?: CardStatus;
      monthLimit?: number | null;
      cardTierId?: number | null;
    },
  ) {
    this.cardId = cardId;
    this.clientId = clientId;
    this.balance = balance;
    this.status = status ?? 'ACTIVE';
    this.cardType = cardType;
    this.dateBegin = dateBegin;
    this.devNomer = devNomer;
    this.nomer = nomer;
    this.monthLimit = monthLimit ?? null;
    this.cardTierId = cardTierId ?? null;
  }

  public static create(data: ICreateCardDto): Card {
    const { clientId, nomer, devNomer, cardType, beginDate, monthLimit, cardTierId } = data;
    const balance = 0;
    return new Card(cardType, nomer, devNomer, balance, beginDate, {
      clientId,
      monthLimit,
      cardTierId,
    });
  }

  public addClientId(clientId: number): void {
    if (!this.clientId) this.clientId = clientId;
  }

  public lock(): void {
    this.status = 'INACTIVE';
  }

  public unlock(): void {
    this.status = 'ACTIVE';
  }

  public delete(): void {
    this.status = 'DELETED';
  }

  public isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  public isLockedBoolean(): boolean {
    return this.status === 'INACTIVE';
  }

  public isDeleted(): boolean {
    return this.status === 'DELETED';
  }

  get isLocked(): number {
    return this.status === 'INACTIVE' ? 1 : 0;
  }

  public static fromEntity(entity: CardEntity): Card {
    const {
      cardId,
      balance,
      status,
      dateBegin,
      client,
      cardType,
      devNomer,
      nomer,
      monthLimit,
      cardTierId,
    } = entity;

    const card = new Card(
      cardType as CardType,
      nomer,
      devNomer,
      balance,
      dateBegin,
      {
        cardId,
        clientId: client?.clientId,
        status: status as CardStatus,
        monthLimit,
        cardTierId,
      },
    );

    return card;
  }

  public toEntity(): Omit<CardEntity, 'client'> {
    const entity = new CardEntity();
    entity.cardId = this.cardId;
    entity.balance = this.balance;
    entity.status = this.status;
    entity.cardType = this.cardType;
    entity.dateBegin = this.dateBegin;
    entity.devNomer = this.devNomer;
    entity.nomer = this.nomer;
    entity.monthLimit = this.monthLimit;
    entity.cardTierId = this.cardTierId;
    return entity;
  }
}