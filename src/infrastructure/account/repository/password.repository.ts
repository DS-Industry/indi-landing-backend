import {Injectable} from "@nestjs/common";
import {IPasswordRepository} from "../../../domain/account/password/password-repository.abstract";
import {InjectRepository} from "@nestjs/typeorm";
import {PasswordEntity} from "../entity/password.entity";
import {Repository} from "typeorm";
import {Password} from "../../../domain/account/password/model/password";
import {Client} from "../../../domain/account/client/model/client";
import {ClientRepository} from './client.repository';
import {CardEntity} from "../entity/card.entity";
import {Card} from "../../../domain/account/card/model/card";

@Injectable()
export class PasswordRepository implements IPasswordRepository{
    constructor(
        @InjectRepository(PasswordEntity)
        private readonly passwordRepository: Repository<PasswordEntity>
    ) {}
    async change(password: Password, newPassword: string): Promise<void> {
        password.password = newPassword;
        await this.passwordRepository.save(password);
    }

    async create(password: Password, client: Client): Promise<any> {
        const pasEntity = this.toPasswordEntity(password);
        pasEntity.client = ClientRepository.toClientEntity(client);

        const newPas = await this.passwordRepository.save(pasEntity);
        return Password.fromEntity(newPas);
    }

    async findOne(clientId: number): Promise<any> {
        const password = await this.passwordRepository
            .createQueryBuilder('password')
            .leftJoin('password.client', 'client')
            .where('client.clientId = :clientId', { clientId })
            .getOne();

        if (!password) return null;

        return Password.fromEntity(password);
    }

    private toPasswordEntity(password: Password): PasswordEntity {
        const passwordEntity: PasswordEntity = new PasswordEntity();

        passwordEntity.password = password.password;

        return passwordEntity;
    }
}