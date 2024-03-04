import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {ClientEntity} from "../../account/entity/client.entity";

@Entity({name: 'INDIAN_SUBSCRIBE', synchronize: false })
export class SubscribeEntity{
    @PrimaryGeneratedColumn({name: 'ID'})
    id: number;

    @OneToOne(() => ClientEntity, (client: ClientEntity) => client.subscribe)
    @JoinColumn({name: 'CLIENT_ID', referencedColumnName: 'clientId'})
    client: ClientEntity;

    @Column( {type: 'varchar2', length: 255, name: 'SUBSCRIBE_ID'})
    subscribeId: string;

    @Column({ type: 'date', name: 'CREATE_AT' })
    createAt: Date;

    @Column( {type: 'varchar2', length: 255, name: 'STATUS'})
    status: string;

    @Column({ type: 'date', name: 'DATE_DEBITING' })
    dateDebiting: Date;
}