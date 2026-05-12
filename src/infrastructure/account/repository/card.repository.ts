import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { ICardRepository } from '../../../domain/account/card/card-repository.abstract';
import { CardEntity } from '../entity/card.entity';
import { Card } from '../../../domain/account/card/model/card';
import { Client } from '../../../domain/account/client/model/client';
import { ClientRepository } from './client.repository';
import { CreateCardBonusOperUseCase } from 'src/aplication/usecases/bonus/create-card-bonus-oper.use-case';

@Injectable()
export class CardRepository implements ICardRepository {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepository: Repository<CardEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}
  async create(card: Card, client: Client): Promise<Card> {
    const cardEntity = this.toCardEntity(card);
    cardEntity.client = ClientRepository.toClientEntity(client);

    const savedEntity = await this.cardRepository.save(cardEntity);
    return Card.fromEntity(savedEntity);
  }

  async delete(cardId: number): Promise<void> {
    await this.cardRepository.delete(cardId);
  }

  async lock(cardId: number): Promise<void> {
    await this.cardRepository.update(cardId, { status: 'INACTIVE' });
  }
  
  async unlock(cardId: number): Promise<void> {
    await this.cardRepository.update(cardId, { status: null });
  }

  async findByClientId(clientId: number): Promise<Card[]> {
    const cards = await this.cardRepository
      .createQueryBuilder('card')
      .leftJoinAndSelect('card.client', 'client')
      .where('client.clientId = :clientId', { clientId })
      .getMany();

    return cards.map(cardEntity => Card.fromEntity(cardEntity));
  }

  async findOneByDevNomer(devNomer: string): Promise<Card | null> {
    const cardEntity = await this.cardRepository.findOne({
      where: { devNomer },
      relations: ['client'],
    });
    return cardEntity ? Card.fromEntity(cardEntity) : null;
  }

  async findOneByNomer(nomer: string): Promise<Card | null> {
    const cardEntity = await this.cardRepository.findOne({
      where: { nomer },
      relations: ['client'],
    });
    return cardEntity ? Card.fromEntity(cardEntity) : null;
  }

  async changeType(cardId: number, newCardType: Card['cardType']): Promise<Card | null> {
    const cardEntity = await this.cardRepository.findOne({ where: { cardId } });
    if (!cardEntity) return null;

    cardEntity.cardType = newCardType;
    const updated = await this.cardRepository.save(cardEntity);
    return Card.fromEntity(updated);
  }

  async changeClient(cardId: number, client: Client): Promise<Card | null> {
    const clientEntity = ClientRepository.toClientEntity(client);
    const cardEntity = await this.cardRepository.findOne({ where: { cardId } });
    if (!cardEntity) return null;

    cardEntity.client = clientEntity;
    const updated = await this.cardRepository.save(cardEntity);
    return Card.fromEntity(updated);
  }

  async update(card: Card): Promise<Card> {
    const entity = this.toCardEntity(card);
    const updated = await this.cardRepository.save(entity);
    return Card.fromEntity(updated);
  }

  private toCardEntity(card: Card): CardEntity {
    const entity = new CardEntity();
    entity.cardId = card.cardId;
    entity.balance = card.balance;
    entity.status = card.status === 'ACTIVE' ? null : card.status;
    entity.cardType = card.cardType;
    entity.dateBegin = card.dateBegin;
    entity.devNomer = card.devNomer;
    entity.nomer = card.nomer;
    entity.monthLimit = card.monthLimit;
    entity.cardTierId = card.cardTierId;
    return entity;
  }
}
