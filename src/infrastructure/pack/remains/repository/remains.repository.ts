import {Injectable} from "@nestjs/common";
import {IRemainsRepository} from "../../../../domain/pack/remains/interface/remains-repository.interface";
import {InjectRepository} from "@nestjs/typeorm";
import {RemainsPackEntity} from "../entity/remains-pack.entity";
import {Repository} from "typeorm";
import {Client} from "../../../../domain/account/client/model/client";
import {Remains} from "../../../../domain/pack/remains/model/remains.model";
import {ClientEntity} from "../../../account/entity/client.entity";

@Injectable()
export class RemainsRepository implements IRemainsRepository{
    constructor(
        @InjectRepository(RemainsPackEntity)
        private readonly remainsRepository: Repository<RemainsPackEntity>,
    ) {}

    async create(remainsPoint: number, client: Client): Promise<Remains> {
        const remainsEntity: RemainsPackEntity = new RemainsPackEntity();

        remainsEntity.remainsPoint = remainsPoint;
        remainsEntity.client = { clientId: client.clientId} as ClientEntity;

        const newRemains = await this.remainsRepository.save(remainsEntity);
        return Remains.fromEntity(newRemains);
    }

    async findOneByClientId(clientId: number): Promise<Remains> {
        const remains = await this.remainsRepository.createQueryBuilder('remains')
            .leftJoinAndSelect('remains.client', 'client')
            .where('client.clientId = :clientId', { clientId })
            .getOne();

        if(!remains) return null;

        return Remains.fromEntity(remains);
    }

    async findOneById(remainsId: number): Promise<Remains> {
        const remains = await this.remainsRepository.findOne({
            where: {
                id: remainsId,
            },
        });

        if(!remains) return null;

        return Remains.fromEntity(remains);
    }

    async updateRemainsPoint(remainsId: number, remainsPoint: number): Promise<Remains> {
        const remains = await this.remainsRepository.findOne({
            where: {
                id: remainsId,
            },
        });

        if(!remains) return null;
        remains.remainsPoint = remainsPoint;
        await this.remainsRepository.save(remains);
        return remains;
    }
}