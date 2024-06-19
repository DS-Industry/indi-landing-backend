import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {ClientEntity} from "../../../account/entity/client.entity";

@Entity({name: 'INDIAN_REMAINS_PACK', synchronize: false})
export class RemainsPackEntity{
    @PrimaryGeneratedColumn({name: 'ID'})
    id: number;

    @OneToOne(() => ClientEntity, (client: ClientEntity) => client.remainsPack)
    @JoinColumn({name: 'CLIENT_ID', referencedColumnName: 'clientId'})
    client: ClientEntity;

    @Column({type:'number', name: 'REMAINS_POINT'})
    remainsPoint: number;
}