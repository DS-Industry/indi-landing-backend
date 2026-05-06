import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { ClientEntity } from './client.entity';
import { InvitedCodeUsageEntity } from './invitedCodeUsage.entity';

@Entity({ name: 'INDIAN_INVITED_CODE', synchronize: false })
export class InvitedCodeEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @OneToOne(() => ClientEntity)
  @JoinColumn({ name: 'CLIENT_ID' })
  client: ClientEntity;

  @Column({ name: 'INVITED_CODE', type: 'varchar', nullable: true })
  invitedCode: string;

  @Column({ name: 'MAX_INVITED', type: 'int', nullable: true })
  maxInvited: number;

  @Column({ name: 'POINT_TO_OWNER', type: 'int', nullable: true })
  pointToOwner: number;

  @Column({ name: 'POINT_TO_USER', type: 'int', nullable: true })
  pointToUser: number;

  @Column({ name: 'CREATE_AT', type: 'timestamp', nullable: true })
  createAt: Date;

  @OneToMany(() => InvitedCodeUsageEntity, (usage) => usage.invitedCode)
  invitedCodeUsages: InvitedCodeUsageEntity[];
}