import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'INDIAN_SUBSCRIBE_MIN', synchronize: false })
export class SubscribeMinEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'SUM_MONEY', type: 'int' })
  sumMoney: number;

  @Column({ name: 'SUM_POINT', type: 'int' })
  sumPoint: number;
}
