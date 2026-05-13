import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { InvitedCodeEntity } from './invitedCode.entity';
import { ClientEntity } from './client.entity';

@Entity({ name: 'INDIAN_INVITED_CODE_USAGE', synchronize: false })
export class InvitedCodeUsageEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @ManyToOne(() => InvitedCodeEntity, (invitedCode) => invitedCode.invitedCodeUsages)
  @JoinColumn({ name: 'INVITED_CODE_ID' })
  invitedCode: InvitedCodeEntity;

  @ManyToOne(() => ClientEntity, (client) => client.invitedCodeUsages)
  @JoinColumn({ name: 'USER_ID' })
  client: ClientEntity;

  @Column({ name: 'CREATE_AT', type: 'timestamp', nullable: true })
  createAt: Date;
}