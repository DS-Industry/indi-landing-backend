import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { PackUsageEntity } from './pack-usage.entity';

@Entity({ name: 'INDIAN_PACK_MIN', synchronize: false })
export class PackEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'NAME', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'DESCRIPTION', type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ name: 'SUM_MONEY', type: 'int' })
  sumMoney: number;

  @Column({ name: 'SUM_POINT', type: 'int' })
  sumPoint: number;

  @Column({ name: 'IS_BURNABLE', type: 'boolean', default: false })
  isBurnable: boolean;

  @Column({ name: 'IS_VISIBLE', type: 'boolean', default: false })
  isVisible: boolean;

  @Column({ name: 'LIFETIME_DAYS', type: 'int', nullable: true })
  lifetimeDays: number;

  @OneToOne(() => PackUsageEntity, (packUsage) => packUsage.pack)
  packUsage: PackUsageEntity;
}