import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {ClientEntity} from "../../../account/entity/client.entity";
import {PackEntity} from "./pack.entity";

@Entity({name: 'INDIAN_PACK_USAGE', synchronize: false})
export class PackUsageEntity{
    @PrimaryGeneratedColumn({name: 'ID'})
    id: number;

    @OneToOne(() => ClientEntity, (client: ClientEntity) => client.packUsage)
    @JoinColumn({name: 'CLIENT_ID', referencedColumnName: 'clientId'})
    client: ClientEntity;

    @OneToOne(() => PackEntity, (pack: PackEntity) => pack.packUsage)
    @JoinColumn({name: 'PACK_ID', referencedColumnName: 'id'})
    pack: PackEntity;

    @Column({ type: 'date', name: 'DATE_USAGE' })
    dateUsage: Date;
}