import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ClientEntity } from '../../../account/entity/client.entity';

@Entity({ name: 'INDIAN_REMAINS_PACK', synchronize: false })
export class RemainsPackEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @OneToOne(() => ClientEntity, (client) => client.remainsPack)
  @JoinColumn({ name: 'CLIENT_ID' })
  client: ClientEntity;

  @Column({ name: 'REMAINS_POINT', type: 'int' })
  remainsPoint: number;
}