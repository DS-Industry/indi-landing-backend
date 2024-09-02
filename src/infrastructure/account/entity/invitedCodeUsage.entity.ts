import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {InvitedCodeEntity} from "./invitedCode.entity";
import {ClientEntity} from "./client.entity";

@Entity({name: 'INDIAN_INVITED_CODE_USAGE', synchronize: false})
export class InvitedCodeUsageEntity{
    @PrimaryGeneratedColumn({name: 'ID'})
    id: number;

    @ManyToOne(() => InvitedCodeEntity, (invitedCode) => invitedCode.invitedCodeUsages, {
        nullable: false,
    })
    @JoinColumn({ name: 'INVITED_CODE_ID', referencedColumnName: 'id' })
    invitedCode: InvitedCodeEntity;

    @ManyToOne(() => ClientEntity, (client) => client.invitedCodeUsages, {
        nullable: false,
    })
    @JoinColumn({ name: 'USER_ID', referencedColumnName: 'clientId' })
    client: ClientEntity;

    @Column({ type: 'date', name: 'CREATE_AT' })
    createAt: Date;
}