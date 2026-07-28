import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CardEntity } from '../../../account/entity/card.entity';

@Entity({ name: 'INDIAN_REMAINS_PACK', synchronize: false })
export class RemainsPackEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @ManyToOne(() => CardEntity, (card) => card.remainsPacks)
  @JoinColumn({ name: 'CARD_ID' })
  card: CardEntity;

  @Column({ name: 'REMAINS_POINT', type: 'int' })
  remainsPoint: number;

  @Column({ name: 'BURN_DATE', type: 'timestamp', nullable: true })
  burnDate: Date;
}
