import {Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {ClientEntity} from "./client.entity";
import {Exclude} from "class-transformer";
import {InvitedCodeUsageEntity} from "./invitedCodeUsage.entity";

@Entity({ name: 'INDIAN_INVITED_CODE', synchronize: false})
export class InvitedCodeEntity {
    @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
    id: number;

    @OneToOne(() => ClientEntity, (client: ClientEntity) => client.invitedCode)
    @JoinColumn({ name: 'CLIENT_ID', referencedColumnName: 'clientId' })
    client: ClientEntity;

    @Exclude()
    @Column({ name: 'INVITED_CODE', type: 'varchar2', nullable: true })
    invitedCode: string;

    @Exclude()
    @Column({ name: 'MAX_INVITED', nullable: true })
    maxInvited: number;

    @Exclude()
    @Column({ name: 'POINT_TO_OWNER', nullable: true })
    pointToOwner: number;

    @Exclude()
    @Column({ name: 'POINT_TO_USER', nullable: true })
    pointToUser: number;

    @Column({ name: 'CREATE_AT' })
    createAt: Date;

    @OneToMany(() => InvitedCodeUsageEntity, (usage) => usage.invitedCode)
    invitedCodeUsages: InvitedCodeUsageEntity[];
}