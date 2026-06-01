import { Card } from './model/card';
import { Client } from '../client/model/client';

export abstract class ICardRepository {
  abstract create(card: Card, client: Client): Promise<Card>;
  abstract findByClientPhysicalId(clientPhysicalId: number): Promise<Card[]>;
  abstract findOneByDevNomer(devNomer: string): Promise<Card | null>;
  abstract findOneByNomer(nomer: string): Promise<Card | null>;
  abstract changeType(cardId: number, newCardType: Card['cardType']): Promise<Card | null>;
  abstract delete(cardId: number): Promise<void>;
  abstract lock(cardId: number): Promise<void>;
  abstract unlock(cardId: number): Promise<void>;
  abstract changeClient(cardId: number, client: Client): Promise<Card | null>;
  abstract update(card: Card): Promise<Card>;
}
