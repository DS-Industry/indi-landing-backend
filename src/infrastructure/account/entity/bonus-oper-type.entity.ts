import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BonusOperEntity } from './bonus-oper.entity';

export enum SignOperType {
  REPLENISHMENT = 'REPLENISHMENT',
  DEDUCTION = 'DEDUCTION',
}

@Entity({ name: 'LTYBonusOperType' })
export class BonusOperTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: SignOperType })
  signOper: SignOperType;

  @OneToMany(() => BonusOperEntity, (oper) => oper.type)
  opers: BonusOperEntity[];
}