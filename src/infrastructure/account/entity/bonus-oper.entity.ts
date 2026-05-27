import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BonusOperTypeEntity } from './bonus-oper-type.entity';
import { CardEntity } from './card.entity';

@Entity({ name: 'LTYBonusOper' })
export class BonusOperEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cardId', nullable: true })
  cardId?: number;

  @Column({ name: 'carWashDeviceId', nullable: true })
  carWashDeviceId?: number;

  @Column({ name: 'typeId' })
  typeId: number;

  @Column({ name: 'operDate', type: 'timestamp' })
  operDate: Date;

  @Column({ name: 'loadDate', type: 'timestamp' })
  loadDate: Date;

  @Column()
  sum: number;

  @Column({ nullable: true })
  comment?: string;

  @Column({ name: 'creatorId', nullable: true })
  creatorId?: number;

  @Column({ name: 'orderId', nullable: true })
  orderId?: number;

  @ManyToOne(() => CardEntity)
  @JoinColumn({ name: 'cardId' })
  card?: CardEntity;

  @ManyToOne(() => BonusOperTypeEntity)
  @JoinColumn({ name: 'typeId' })
  type?: BonusOperTypeEntity;
}