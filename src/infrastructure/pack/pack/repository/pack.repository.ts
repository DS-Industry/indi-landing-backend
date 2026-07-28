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
import {Card} from "../../../../domain/account/card/model/card";
import { ConfigService } from '@nestjs/config';
import { CreateCardBonusOperUseCase } from "src/aplication/usecases/bonus/create-card-bonus-oper.use-case";

@Injectable()
export class PackRepository implements IPackRepository{

    constructor(
        @InjectRepository(PackEntity)
        private readonly packRepository: Repository<PackEntity>,
        @InjectRepository(PackUsageEntity)
        private readonly packUsageRepository: Repository<PackUsageEntity>,
        @InjectDataSource()
        private readonly dataSource: DataSource,
        private readonly createBonusOperUseCase: CreateCardBonusOperUseCase,
    ) {}

    async apply(pack: Pack, client: Client, card: Card, payId: string): Promise<any> {
      const packUsage = new PackUsageEntity();

      packUsage.pack = { id: pack.id } as PackEntity;
      packUsage.client = { clientId: client.clientId} as ClientEntity;
      packUsage.dateUsage = new Date();
      await this.packUsageRepository.save(packUsage);
  
      try {
          await this.createBonusOperUseCase.execute(
              {
                  typeOperId: 6,
                  operDate: new Date(),
                  sum: pack.sumPoint,
              },
              card,
          );
          return 1;
      } catch (error) {
          console.error('Error during pack bonus accrual:', error);
          throw error;
      }
  }

    async create(data: AddPackDto): Promise<Pack> {
        const packEntity: PackEntity = new PackEntity();

        packEntity.name = data.name;
        packEntity.description = data.description ? data.description : null;
        packEntity.sumPoint = data.sumPoint;
        packEntity.sumMoney = data.sumMoney;
        packEntity.isBurnable = data.isBurnable ?? false;
        packEntity.isVisible = data.isVisible ?? false;
        packEntity.lifetimeDays = data.lifetimeDays ?? null;

        const newPack = await this.packRepository.save(packEntity);
        return Pack.fromEntity(newPack);
    }

    async findOneById(packId: number): Promise<Pack> {
        const pack = await this.packRepository.findOne({
            where: {
                id: packId,
                isVisible: true,
            },
        });

        if(!pack) return null;

        return Pack.fromEntity(pack);
    }

    async findLastOperDateById(client: Client): Promise<Date> {
        const packUsage = await this.packUsageRepository.findOne({
            where:{
                client: { clientId: client.clientId} as ClientEntity
            },
            order: {
                dateUsage: 'DESC',
            },
        })
        if (!packUsage) return null;

        return packUsage.dateUsage;
    }

   async getAll(): Promise<Pack[]> {
        const packs = await this.packRepository.find({
            where: {
                isVisible: true,
            },
            order: {
                id: 'ASC',
            },
        });
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
        packEntity.isBurnable = pack.isBurnable ?? false;
        packEntity.isVisible = pack.isVisible ?? false;
        packEntity.lifetimeDays = pack.lifetimeDays ?? null;

        return packEntity;
    }
}