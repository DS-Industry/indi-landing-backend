import {Injectable} from "@nestjs/common";
import {ISubscribeRepository} from "../../../domain/subscribe/interface/subscribe-repository.interface";
import {SubscribeEntity} from "../entity/subscribe.entity";
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {Subscribe} from "../../../domain/subscribe/model/subscribe.model";
import {Client} from "../../../domain/account/client/model/client";
import {ClientRepository} from "../../account/repository/client.repository";
import {SubscribeDto} from "../../../aplication/usecases/subscribe/dto/subscribe.dto";
import {Card} from "../../../domain/account/card/model/card";
import * as oracledb from 'oracledb';
import {ReplenishmentDto} from "../../../api/subscribe/dto/replenishment.dto";


@Injectable()
export class SubscribeRepository implements ISubscribeRepository{

    constructor(
        @InjectRepository(SubscribeEntity)
        private readonly subscribeRepository: Repository<SubscribeEntity>,
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    async create(data: SubscribeDto, client: Client): Promise<any> {
        const subscribeEntity: SubscribeEntity = new SubscribeEntity();
        const clientEntity = ClientRepository.toClientEntity(client);

        subscribeEntity.subscribeId = data.subscribeId;
        subscribeEntity.status = data.status;
        subscribeEntity.dateDebiting = data.dateDebiting ? data.dateDebiting : null;
        subscribeEntity.client = clientEntity;

        const newSubscribe = await this.subscribeRepository.save(subscribeEntity);
        return Subscribe.fromEntity(newSubscribe)
    }

    async findOneByClient(clientId: number): Promise<any> {
        const subscribe = await this.subscribeRepository.createQueryBuilder('subscribe')
            .leftJoinAndSelect('subscribe.client', 'client')
            .where('client.clientId = :clientId', { clientId })
            .andWhere('subscribe.status != :status', { status: 'closed' })
            .getOne();

        if(!subscribe) return null;

        return Subscribe.fromEntity(subscribe);
    }

    async findOneByIdSub(subscribeId:string): Promise<any> {
        const subscribe = await this.subscribeRepository.createQueryBuilder('subscribe')
            .leftJoinAndSelect('subscribe.client', 'client')
            .where('subscribe.subscribeId = :subscribeId', { subscribeId })
            .getOne();

        if (!subscribe) return null;
        return Subscribe.fromEntity(subscribe);
    }

    async update(subscribe: Subscribe, client: Client): Promise<any>{
        const subscribeEntity = this.toSubscribeEntity(subscribe);
        subscribeEntity.client = ClientRepository.toClientEntity(client);

        const { id, ...updateData} = subscribeEntity;

        const updateSubscribe = await this.subscribeRepository.update(
            {
                id: id,
            },
            updateData,
        );

        if (!updateSubscribe) return null;

        return updateSubscribe;
    }

    private toSubscribeEntity(subscribe: Subscribe): SubscribeEntity{
        const subscribeEntity: SubscribeEntity = new SubscribeEntity();

        subscribeEntity.id = subscribe.id ? subscribe.id : null;
        subscribeEntity.subscribeId = subscribe.subscribeId;
        subscribeEntity.createAt = subscribe.createAt ? subscribe.createAt : null;
        subscribeEntity.status = subscribe.status;
        subscribeEntity.dateDebiting = subscribe.dateDebiting ? subscribe.dateDebiting : null;

        return subscribeEntity;
    }

    async replenishment(subscribe: ReplenishmentDto, amount: number, client: Client, card: Card){
        const addTransactionQuery = `begin :p0 := cwash.PAY_OPER_PKG.add_oper_open(:p1, :p2, :p3, :p4, :p5, :p6); end;`;
        const runAddPyamentQuery = await this.dataSource.query(
            addTransactionQuery,
            [
                { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                card.nomer,
                client.email,
                client.correctPhone,
                amount,
                subscribe.payId,
                new Date(),
            ],
        );
        return runAddPyamentQuery[0];
    }

    async findAllActive(): Promise<any>{
        const currentDateTime = new Date();
        const currentDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());

        const activeSubscribes = await this.subscribeRepository.createQueryBuilder('subscribe')
            .leftJoinAndSelect('subscribe.client', 'client')
            .where('subscribe.DATE_DEBITING < :currentDate', { currentDate })
            .getMany();

        return activeSubscribes.map(subscribe => Subscribe.fromEntity(subscribe));
    }
}