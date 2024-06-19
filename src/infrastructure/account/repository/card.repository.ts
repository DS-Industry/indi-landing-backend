import { Injectable } from '@nestjs/common';
import { ICardRepository } from '../../../domain/account/card/card-repository.abstract';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import { CardEntity } from '../entity/card.entity';
import {DataSource, Repository} from 'typeorm';
import { Card } from '../../../domain/account/card/model/card';
import { Client } from '../../../domain/account/client/model/client';
import { ClientEntity } from '../entity/client.entity';
import { ClientRepository } from './client.repository';
import * as oracledb from 'oracledb';

@Injectable()
export class CardRepository implements ICardRepository {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepository: Repository<CardEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}
  async create(card: Card, client: Client): Promise<Card> {
    const cardEntity = this.toCardEntity(card);
    const clientEntity = ClientRepository.toClientEntity(client);

    cardEntity.client = clientEntity;

    const newCard = await this.cardRepository.save(cardEntity);
    return Card.fromEntity(newCard);
  }

  async delete(cardId: number): Promise<void> {
    return Promise.resolve(undefined);
  }

  async findByClientId(clientId: number): Promise<Card[]> {
    const card = await this.cardRepository
      .createQueryBuilder('card')
      .leftJoin('card.client', 'client')
      .where('client.clientId = :clientId', { clientId })
      .getMany();

    const cards = card.map((cardEntity: CardEntity) =>
      Card.fromEntity(cardEntity),
    );

    if (!cards) return null;

    return cards;
  }

  async findOneByDevNomer(devNomer: string): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: {
        devNomer: devNomer,
      },
    });

    if (!card) return null;
    return Card.fromEntity(card);
  }

  async findOneByNomer(nomer: string): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: {
        nomer: nomer,
      },
    });

    if (!card) return null;
    return Card.fromEntity(card);
  }

  async changeType(cardId: number, newCardTypeId: number): Promise<any> {
    const card = await this.cardRepository.findOne({
      where: {
        cardId: cardId,
      },
    });

    if (!card) return null;
    card.cardTypeId = newCardTypeId;
    await this.cardRepository.save(card);
    return card;
  }

  async changeClient(cardId: number, client: Client): Promise<any> {
    const clientEntity = ClientRepository.toClientEntity(client);
    const card = await this.cardRepository.findOne({
      where: {
        cardId: cardId,
      },
    });

    if (!card) return null;
    card.client = clientEntity;
    await this.cardRepository.save(card);
    return card;
  }

  async zeroingOut(card: Card, minusPoint: number): Promise<any>{

    const addTransactionQuery = `begin cwash.card_pkg.add_oper(:p0, :p1, :p2, :p3, :p4); end;`;
    const runAddPyamentQuery = await this.dataSource.query(
        addTransactionQuery,
        [
          card.cardId,
          5,
          minusPoint,
          'Списание неиспользованных баллов по подписке',
          3,
        ],
    );
    return 'SUCCESS';
  }

  async lock(cardId: number): Promise<void> {
    return Promise.resolve(undefined);
  }

  private toCardEntity(card: Card): CardEntity {
    const cardEntity: CardEntity = new CardEntity();

    cardEntity.isLocked = card.isLocked;
    cardEntity.dateEnd = card.dateEnd;
    cardEntity.cardTypeId = card.cardTypeId;
    cardEntity.devNomer = card.devNomer;
    cardEntity.isDel = card.isDel;
    cardEntity.cmnCity = card.cmnCity;
    cardEntity.nomer = card.nomer;
    cardEntity.tag = card.tag;
    cardEntity.balance = card.balance;
    cardEntity.realBalance = card.realBalance;
    cardEntity.airBalance = card.airBalance;

    return cardEntity;
  }
}
