import {Column, Entity, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {PackUsageEntity} from "./pack-usage.entity";

@Entity({name: 'INDIAN_PACK_MIN', synchronize: false })
export class PackEntity{
    @PrimaryGeneratedColumn({name: 'ID'})
    id: number;

    @Column( {type: 'varchar2', length: 255, name: 'NAME'})
    name: string;

    @Column( {type: 'varchar2', length: 255, name: 'DESCRIPTION'})
    description: string;

    @Column({type: 'number', name: 'SUM_MONEY'})
    sumMoney: number;

    @Column({type: 'number', name: 'SUM_POINT'})
    sumPoint: number;

    @OneToOne( () => PackUsageEntity, (packUsage: PackUsageEntity) => packUsage.pack)
    packUsage: PackUsageEntity;
}