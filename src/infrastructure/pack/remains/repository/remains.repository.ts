import {Injectable} from "@nestjs/common";
import {IRemainsRepository} from "../../../../domain/pack/remains/interface/remains-repository.interface";
import {InjectRepository} from "@nestjs/typeorm";
import {RemainsPackEntity} from "../entity/remains-pack.entity";
import {Repository} from "typeorm";
import {Card} from "../../../../domain/account/card/model/card";
import {Remains} from "../../../../domain/pack/remains/model/remains.model";
import {CardEntity} from "../../../account/entity/card.entity";

@Injectable()
export class RemainsRepository implements IRemainsRepository{
    constructor(
        @InjectRepository(RemainsPackEntity)
        private readonly remainsRepository: Repository<RemainsPackEntity>,
    ) {}

    async create(remainsPoint: number, card: Card, burnDate?: Date): Promise<Remains> {
        const remainsEntity: RemainsPackEntity = new RemainsPackEntity();

        remainsEntity.remainsPoint = remainsPoint;
        remainsEntity.card = { cardId: card.cardId} as CardEntity;
        remainsEntity.burnDate = burnDate ?? null;

        const newRemains = await this.remainsRepository.save(remainsEntity);
        return Remains.fromEntity(newRemains);
    }

    async findOneByCardId(cardId: number): Promise<Remains> {
        const remains = await this.remainsRepository.createQueryBuilder('remains')
            .leftJoinAndSelect('remains.card', 'card')
            .where('card.cardId = :cardId', { cardId })
            .getOne();

        if(!remains) return null;

        return Remains.fromEntity(remains);
    }

    async findBurnableByCardId(cardId: number): Promise<Remains[]> {
        const remains = await this.remainsRepository.createQueryBuilder('remains')
            .leftJoinAndSelect('remains.card', 'card')
            .where('card.cardId = :cardId', { cardId })
            .andWhere('remains.remainsPoint > 0')
            .getMany();

        return remains.map((item) => Remains.fromEntity(item));
    }

    async findOneById(remainsId: number): Promise<Remains> {
        const remains = await this.remainsRepository.findOne({
            where: {
                id: remainsId,
            },
            relations: ['card'],
        });

        if(!remains) return null;

        return Remains.fromEntity(remains);
    }

    async updateRemainsPoint(remainsId: number, remainsPoint: number, burnDate?: Date): Promise<Remains> {
        const remains = await this.remainsRepository.findOne({
            where: {
                id: remainsId,
            },
            relations: ['card'],
        });

        if(!remains) return null;
        remains.remainsPoint = remainsPoint;
        if (burnDate !== undefined) {
            remains.burnDate = burnDate;
        }
        await this.remainsRepository.save(remains);
        return Remains.fromEntity(remains);
    }
}
