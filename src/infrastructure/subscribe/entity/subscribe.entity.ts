import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ClientEntity } from '../../account/entity/client.entity';

@Entity({ name: 'INDIAN_SUBSCRIBE', synchronize: false })
export class SubscribeEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @OneToOne(() => ClientEntity, (client) => client.subscribe)
  @JoinColumn({ name: 'CLIENT_ID' })
  client: ClientEntity;

  @Column({ name: 'SUBSCRIBE_ID', type: 'varchar', length: 255 })
  subscribeId: string;

  @Column({ name: 'CREATE_AT', type: 'timestamp', nullable: true })
  createAt: Date;

  @Column({ name: 'STATUS', type: 'varchar', length: 255 })
  status: string;

  @Column({ name: 'DATE_DEBITING', type: 'timestamp', nullable: true })
  dateDebiting: Date;
}