import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ClientEntity } from './client.entity';

@Entity({ name: 'LTYCard', synchronize: false })
export class CardEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  cardId: number;

  @Column({ name: 'balance', type: 'int', default: 0 })
  balance: number;

  @Column({ name: 'status', type: 'varchar', length: 20, nullable: true })
  status: string | null;        // 'INACTIVE'

  @Column({ name: 'createdAt', type: 'timestamp', nullable: true })
  dateBegin: Date;

  @ManyToOne(() => ClientEntity, (client) => client.cards)
  @JoinColumn({ name: 'clientId' })
  client: ClientEntity;

  @Column({ name: 'type', type: 'varchar', length: 20 })
  cardType: string;             // 'VIRTUAL' или 'PHYSICAL'

  @Column({ name: 'unqNumber', length: 50 })
  devNomer: string;

  @Column({ name: 'number', length: 50 })
  nomer: string;

  @Column({ name: 'monthlyLimit', type: 'int', nullable: true })
  monthLimit: number | null;

  @Column({ name: 'cardTierId', type: 'int', nullable: true })
  cardTierId: number | null;
}
