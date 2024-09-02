import {Injectable} from "@nestjs/common";
import {IInvitedCodeRepository} from "../../../domain/account/invitedCode/invited-code-repository.abstract";
import {InvitedCode} from "../../../domain/account/invitedCode/model/invitedCode";
import {Client} from "../../../domain/account/client/model/client";
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {InvitedCodeEntity} from "../entity/invitedCode.entity";
import {DataSource, Repository} from "typeorm";
import {ClientRepository} from "./client.repository";
import {InvitedCodeUsageEntity} from "../entity/invitedCodeUsage.entity";
import {ClientEntity} from "../entity/client.entity";
import * as oracledb from 'oracledb';
import {Card} from "../../../domain/account/card/model/card";

@Injectable()
export class InvitedCodeRepository implements IInvitedCodeRepository{
    constructor(
        @InjectRepository(InvitedCodeEntity)
        private readonly invitedCodeRepository: Repository<InvitedCodeEntity>,
        @InjectRepository(InvitedCodeUsageEntity)
        private readonly invitedCodeUsageRepository: Repository<InvitedCodeUsageEntity>,
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    public async apply(invitedCode: InvitedCode, owner: Client, user: Client): Promise<void> {
        const invitedCodeUsage = new InvitedCodeUsageEntity();

        invitedCodeUsage.invitedCode = { id: invitedCode.id } as InvitedCodeEntity;
        invitedCodeUsage.client = { clientId: user.clientId} as ClientEntity;

        await this.invitedCodeUsageRepository.save(invitedCodeUsage);

        const payIdOwner = this.generateUniqueExt();
        const cardOwner = owner.getCard();
        const addTransactionQueryOwner = `begin :p0 := cwash.PAY_OPER_PKG.add_oper_open(:p1, :p2, :p3, :p4, :p5, :p6); end;`;
        const runAddPyamentQueryOwner = await this.dataSource.query(
            addTransactionQueryOwner,
            [
                { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                cardOwner.nomer,
                owner.email,
                owner.correctPhone,
                invitedCode.pointToOwner,
                payIdOwner,
                new Date(),
            ],
        );

        const payIdUser = this.generateUniqueExt();
        const cardUser = user.getCard();
        const addTransactionQueryUser = `begin :p0 := cwash.PAY_OPER_PKG.add_oper_open(:p1, :p2, :p3, :p4, :p5, :p6); end;`;
        const runAddPyamentQueryUser = await this.dataSource.query(
            addTransactionQueryUser,
            [
                { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                cardUser.nomer,
                user.email,
                user.correctPhone,
                invitedCode.pointToUser,
                payIdUser,
                new Date(),
            ],
        );

        /*
        const payIdOwner = this.generateUniqueExt();
        const cardOwner = owner.getCard();
        const addTransactionQueryOwner = `begin :p0 := cwash.card_pkg.add_oper(:p1, :p2, :p3, :p4, :p5); end;`;
        const runAddPyamentQueryOwner = await this.dataSource.query(
            addTransactionQueryOwner,
            [
                { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                cardOwner.cardId,
                41,
                invitedCode.pointToOwner,
                'Подарочные бонусы за Реферальную программу',
                3
            ],
        );

        const payIdUser = this.generateUniqueExt();
        const cardUser = user.getCard();
        const addTransactionQueryUser = `begin :p0 := cwash.CARD_PKG.add_oper(:p1, :p2, :p3, :p4, :p5); end;`;
        const runAddPyamentQueryUser = await this.dataSource.query(
            addTransactionQueryUser,
            [
                { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                cardUser.cardId,
                41,
                invitedCode.pointToUser,
                'Подарочные бонусы за Реферальную программу',
                3
            ],
        );*/
    }
    public async findAllClientByCodeId(id: number): Promise<any> {
        const inviteCodeUsage = await this.invitedCodeUsageRepository.createQueryBuilder('inviteCodeUsage')
            .leftJoinAndSelect('inviteCodeUsage.invitedCode', 'invitedCode')
            .leftJoinAndSelect('inviteCodeUsage.client', 'client')
            .where('invitedCode.id = :id', { id })
            .getMany();

        if (!inviteCodeUsage) return null;

        const clients = inviteCodeUsage.map((usage: InvitedCodeUsageEntity) => usage.client);

        return clients.map((clientEntity: ClientEntity) => Client.fromEntity(clientEntity));
    }
    public async create(invitedCode: InvitedCode, client: Client): Promise<any> {
        const invitedCodeEntity = this.toInvitedCodeEntity(invitedCode);
        invitedCodeEntity.client = ClientRepository.toClientEntity(client);

        const newInvitedCode = await this.invitedCodeRepository.save(invitedCodeEntity);
        return InvitedCode.fromEntity(newInvitedCode);
    }

    public async findOneByClientId(clientId: number): Promise<any> {
        const invitedCode = await this.invitedCodeRepository.createQueryBuilder('invitedCode')
            .leftJoinAndSelect('invitedCode.client', 'client')
            .where('client.clientId = :clientId', { clientId })
            .getOne();

        if (!invitedCode) return null;
        return InvitedCode.fromEntity(invitedCode);
    }

    public async findOneByCode(invitedCode: string): Promise<any> {
        const inviteCode = await this.invitedCodeRepository.createQueryBuilder('inviteCode')
            .leftJoinAndSelect('inviteCode.client', 'client')
            .where('inviteCode.invitedCode = :invitedCode', { invitedCode })
            .getOne();

        if (!inviteCode) return null;

        return InvitedCode.fromEntity(inviteCode);
    }

    public async findOneById(id: number): Promise<any> {
        const invitedCode = await this.invitedCodeRepository.createQueryBuilder('invitedCode')
            .leftJoinAndSelect('invitedCode.client', 'client')
            .where('invitedCode.id = :id', { id })
            .getOne();

        if (!invitedCode) return null;

        return InvitedCode.fromEntity(invitedCode);
    }

    private toInvitedCodeEntity(invitedCode: InvitedCode): InvitedCodeEntity {
        const invitedCodeEntity: InvitedCodeEntity = new InvitedCodeEntity();

        invitedCodeEntity.invitedCode = invitedCode.invitedCode;
        invitedCodeEntity.maxInvited = invitedCode.maxInvited;
        invitedCodeEntity.pointToOwner = invitedCode.pointToOwner;
        invitedCodeEntity.pointToUser = invitedCode.pointToUser;

        return invitedCodeEntity;
    }

    private generateUniqueExt() {
        const prefix = 'Indian_ref_';
        const uniqueId = Date.now(); // получаем текущую дату и время в миллисекундах как уникальный идентификатор
        const random = Math.random();
        return `${prefix}_${uniqueId}_${random}`;
    }
}