import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ClientEntity } from './client.entity';

@Entity({ name: 'INDIAN_CLIENT_PSW', synchronize: false })
export class PasswordEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @OneToOne(() => ClientEntity, (client) => client.password)
  @JoinColumn({ name: 'CLIENT_ID' })
  client: ClientEntity;

  @Column({ name: 'PASSWORD', type: 'varchar' })
  password: string;
}
