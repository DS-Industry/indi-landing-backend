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
import {ConfigService} from '@nestjs/config';
import { CreateCardBonusOperUseCase } from "src/aplication/usecases/bonus/create-card-bonus-oper.use-case";

@Injectable()
export class InvitedCodeRepository implements IInvitedCodeRepository{
    constructor(
        @InjectRepository(InvitedCodeEntity)
        private readonly invitedCodeRepository: Repository<InvitedCodeEntity>,
        @InjectRepository(InvitedCodeUsageEntity)
        private readonly invitedCodeUsageRepository: Repository<InvitedCodeUsageEntity>,
        @InjectDataSource()
        private readonly dataSource: DataSource,
        private readonly configService: ConfigService,
        private readonly createBonusOperUseCase: CreateCardBonusOperUseCase,
    ) {}

    public async apply(invitedCode: InvitedCode, owner: Client, user: Client): Promise<void> {
        const invitedCodeUsage = new InvitedCodeUsageEntity();

        invitedCodeUsage.invitedCode = { id: invitedCode.id } as InvitedCodeEntity;
        invitedCodeUsage.client = { clientId: user.clientId} as ClientEntity;

        await this.invitedCodeUsageRepository.save(invitedCodeUsage);

        const stubTransactions = this.configService.get<string>('DB_FEATURE_STUB_TRANSACTIONS') === 'true';
        if (stubTransactions) {
            return;
        }

        const cardOwner = owner.getCard();
        if (cardOwner) {
            await this.createBonusOperUseCase.execute(
                {
                    typeOperId: 6,
                    operDate: new Date(),
                    sum: invitedCode.pointToOwner,
                },
                cardOwner,
            );
        }

        const cardUser = user.getCard();
        if (cardUser) {
            await this.createBonusOperUseCase.execute(
                {
                    typeOperId: 6,
                    operDate: new Date(),
                    sum: invitedCode.pointToUser,
                },
                cardUser,
            );
        }
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
        const uniqueId = Date.now();
        const random = Math.random();
        return `${prefix}_${uniqueId}_${random}`;
    }
}