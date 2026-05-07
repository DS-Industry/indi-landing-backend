import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { CardEntity } from './card.entity';
import { PasswordEntity } from './password.entity';
import { SubscribeEntity } from '../../subscribe/entity/subscribe.entity';
import { PackUsageEntity } from '../../pack/pack/entity/pack-usage.entity';
import { RemainsPackEntity } from '../../pack/remains/entity/remains-pack.entity';
import { InvitedCodeEntity } from './invitedCode.entity';
import { InvitedCodeUsageEntity } from './invitedCodeUsage.entity';

@Entity({ name: 'LTYUser', synchronize: false })
export class ClientEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  clientId: number;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'email', type: 'varchar', nullable: true })
  email: string;

  @Column({ name: 'phone', type: 'varchar', unique: true })
  phone: string;                     // будет маппиться на correctPhone в домене

  @Column({ name: 'birthday', type: 'date', nullable: true })
  birthday: Date;

  @Column({ name: 'createdAt', type: 'timestamp', nullable: true })
  insDate: Date;                     // → createdAt

  @Column({ name: 'updatedAt', type: 'timestamp', nullable: true })
  updDate: Date;                     // → updatedAt

  @Column({ name: 'contractType', type: 'varchar', length: 50, default: 'INDIVIDUAL' })
  contractType: string;   // теперь хранит 'INDIVIDUAL' или 'CORPORATE'
  
  @Column({ name: 'comment', type: 'text', nullable: true })
  note: string;                      // → comment

  @Column({ name: 'infoCar', type: 'varchar', nullable: true })
  avto: string;                      // → avto (старое поле, теперь infoCar)

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'ACTIVE' })
  isActivated: number;               // 1 → 'ACTIVE', 0 → 'INACTIVE'

  @Column({ name: 'gender', type: 'varchar', length: 10, nullable: true })
  genderId: number;                  // маппим: 'MALE' → 1, 'FEMALE' → 2

  @Column({ name: 'refreshTokenId', type: 'varchar', nullable: true })
  refreshToken: string;

  // Связи (имена полей оставляем как в старом домене)
  @OneToMany(() => CardEntity, (card) => card.client)
  cards: CardEntity[];               // → cardPhysicals

  @OneToOne(() => PasswordEntity, (password) => password.client)
  password: PasswordEntity;

  @OneToOne(() => SubscribeEntity, (subscribe) => subscribe.client)
  subscribe: SubscribeEntity;

  @OneToOne(() => PackUsageEntity, (packUsage) => packUsage.client)
  packUsage: PackUsageEntity;

  @OneToOne(() => RemainsPackEntity, (remainsPack) => remainsPack.client)
  remainsPack: RemainsPackEntity;

  @OneToOne(() => InvitedCodeEntity, (invitedCode) => invitedCode.client)
  invitedCode: InvitedCodeEntity;

  @OneToMany(() => InvitedCodeUsageEntity, (usage) => usage.client)
  invitedCodeUsages: InvitedCodeUsageEntity[];
}