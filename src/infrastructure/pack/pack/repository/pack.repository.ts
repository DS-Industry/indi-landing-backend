import {Injectable} from "@nestjs/common";
import {IPackRepository} from "../../../../domain/pack/pack/interface/pack-repository.interface";
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {PackEntity} from "../entity/pack.entity";
import {DataSource, Repository} from "typeorm";
import {PackUsageEntity} from "../entity/pack-usage.entity";
import {Pack} from "../../../../domain/pack/pack/model/pack.model";
import {Client} from "../../../../domain/account/client/model/client";
import {AddPackDto} from "../../../../domain/pack/pack/dto/add-pack.dto";
import {ClientEntity} from "../../../account/entity/client.entity";
import * as oracledb from 'oracledb';
import {Card} from "../../../../domain/account/card/model/card";

@Injectable()
export class PackRepository implements IPackRepository{

    constructor(
        @InjectRepository(PackEntity)
        private readonly packRepository: Repository<PackEntity>,
        @InjectRepository(PackUsageEntity)
        private readonly packUsageRepository: Repository<PackUsageEntity>,
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    async apply(pack: Pack, client: Client, card: Card, payId: string): Promise<any> {
        const packUsage = new PackUsageEntity();

        packUsage.pack = { id: pack.id } as PackEntity;
        packUsage.client = { clientId: client.clientId} as ClientEntity;

        await this.packUsageRepository.save(packUsage);

        const addTransactionQuery = `begin :p0 := cwash.PAY_OPER_PKG.add_oper_open(:p1, :p2, :p3, :p4, :p5, :p6); end;`;
        const runAddPyamentQuery = await this.dataSource.query(
            addTransactionQuery,
            [
                { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                card.nomer,
                client.email,
                client.correctPhone,
                pack.sumPoint,
                payId,
                new Date(),
            ],
        );
        return runAddPyamentQuery[0];
    }

    async create(data: AddPackDto): Promise<Pack> {
        const packEntity: PackEntity = new PackEntity();

        packEntity.name = data.name;
        packEntity.description = data.description ? data.description : null;
        packEntity.sumPoint = data.sumPoint;
        packEntity.sumMoney = data.sumMoney;

        const newPack = await this.packRepository.save(packEntity);
        return Pack.fromEntity(newPack);
    }

    async findOneById(packId: number): Promise<Pack> {
        const pack = await this.packRepository.findOne({
            where: {
                id: packId,
            },
        });

        if(!pack) return null;

        return Pack.fromEntity(pack);
    }

   async getAll(): Promise<Pack[]> {
        const packs = await this.packRepository.find();
        return packs.map(pack => Pack.fromEntity(pack));
    }

    async update(pack: Pack): Promise<any> {
        const packEntity = this.toPackEntity(pack);

        const { id, ...updateData} = packEntity;
        const updatePack = await this.packRepository.update(
            {
                id: id,
            },
            updateData,
        );

        if(!updatePack) return null;

        return updatePack;
    }

    private toPackEntity(pack: Pack): PackEntity {
        const packEntity: PackEntity = new PackEntity();

        packEntity.id = pack.id ? pack.id : null;
        packEntity.name = pack.name ? pack.name : null;
        packEntity.description = pack.description ? pack.description : null;
        packEntity.sumMoney = pack.sumMoney ? pack.sumMoney : null;
        packEntity.sumPoint = pack.sumPoint ? pack.sumPoint : null;

        return packEntity;
    }


}