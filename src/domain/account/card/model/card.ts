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
  clientPhysicalId?: number;
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
      clientPhysicalId,
      status,
      monthLimit,
      cardTierId,
    }: {
      cardId?: number;
      clientPhysicalId?: number;
      status?: CardStatus;
      monthLimit?: number | null;
      cardTierId?: number | null;
    },
  ) {
    this.cardId = cardId;
    this.clientPhysicalId = clientPhysicalId;
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
    const { clientPhysicalId, nomer, devNomer, cardType, beginDate, monthLimit, cardTierId } = data;
    const balance = 0;
    return new Card(cardType, nomer, devNomer, balance, beginDate, {
      clientPhysicalId,
      monthLimit,
      cardTierId,
    });
  }

  public addClientPhysicalId(clientPhysicalId: number): void {
    if (!this.clientPhysicalId) this.clientPhysicalId = clientPhysicalId;
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
      clientPhysical,
      clientPhysicalId,
      cardType,
      devNomer,
      nomer,
      monthLimit,
      cardTierId,
    } = entity;

    return new Card(
      cardType as CardType,
      nomer,
      devNomer,
      balance,
      dateBegin,
      {
        cardId,
        clientPhysicalId: clientPhysicalId ?? clientPhysical?.clientId ?? undefined,
        status: status === null ? 'ACTIVE' : (status as CardStatus),
        monthLimit,
        cardTierId,
      },
    );
  }

  public toEntity(): Omit<CardEntity, 'clientPhysical'> {
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
