import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ClientEntity } from '../../../account/entity/client.entity';
import { PackEntity } from './pack.entity';

@Entity({ name: 'INDIAN_PACK_USAGE', synchronize: false })
export class PackUsageEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @OneToOne(() => ClientEntity, (client) => client.packUsage)
  @JoinColumn({ name: 'CLIENT_ID' })
  client: ClientEntity;

  @OneToOne(() => PackEntity, (pack) => pack.packUsage)
  @JoinColumn({ name: 'PACK_ID' })
  pack: PackEntity;

  @Column({ name: 'DATE_USAGE', type: 'timestamp', nullable: true })
  dateUsage: Date;
}