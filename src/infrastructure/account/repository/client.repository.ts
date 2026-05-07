import { IClientRepository } from '../../../domain/account/client/client-repository.abstract';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientEntity } from '../entity/client.entity';
import { Repository } from 'typeorm';
import { Client } from '../../../domain/account/client/model/client';
import { ClientType } from '../../../domain/account/client/enum/clinet-type.enum';

@Injectable()
export class ClientRepository implements IClientRepository {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) {}

  async create(client: Client): Promise<Client> {
    const clientEntity = this.toClientEntity(client);
    const newClient = await this.clientRepository.save(clientEntity);
    return Client.fromEntity(newClient);
  }

  async findOneByPhone(phone: string): Promise<Client | null> {
    const clientEntity = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.cards', 'cards')
      .where('client.phone = :phone', { phone })
      .orderBy('client.insDate', 'DESC')
      .getOne();

    return clientEntity ? Client.fromEntity(clientEntity) : null;
  }

  async findOneById(clientId: number): Promise<Client | null> {
    const clientEntity = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.cards', 'cards')
      .where('client.clientId = :clientId', { clientId })
      .orderBy('client.insDate', 'DESC')
      .getOne();

    return clientEntity ? Client.fromEntity(clientEntity) : null;
  }

  async setRefreshToken(phone: string, token: string): Promise<void> {
    const clientEntity = await this.clientRepository.findOne({
      where: { phone },
    });
    if (!clientEntity) return;
    clientEntity.refreshToken = token;
    await this.clientRepository.save(clientEntity);
  }

  async update(client: Client): Promise<any> {
    const clientEntity = this.toClientEntity(client);
    const { clientId, ...updateData } = clientEntity;
    const result = await this.clientRepository.update(clientId, updateData);
    return result;
  }

  private toClientEntity(client: Client): ClientEntity {
    const entity = new ClientEntity();
    entity.clientId = client.clientId;
    entity.name = client.name;
    entity.email = client.email;
    entity.phone = client.phone;
    entity.birthday = client.birthday;
    entity.insDate = client.insDate;
    entity.updDate = client.updDate;
    entity.contractType = client.clientTypeId === ClientType.CORPORATE ? 'CORPORATE' : 'INDIVIDUAL';
    entity.status = client.status;
    entity.genderId = client.genderId;
    entity.refreshToken = client.refreshToken;
    return entity;
  }

  public static toClientEntity(client: Client): ClientEntity {
    const repo = new ClientRepository(null as any);
    return repo.toClientEntity(client);
  }
}
