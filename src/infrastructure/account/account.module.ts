import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity } from './entity/card.entity';
import { ClientEntity } from './entity/client.entity';
import { AccountRepositoryProvider } from './provider/account-repository.provider';
import { ClientRepository } from './repository/client.repository';
import { CardRepository } from './repository/card.repository';
import { AccountController } from '../../api/account/account.controller';
import { AccountUsecase } from '../../aplication/usecases/account/account.usecase';
import { DateModule } from '../services/date/date.module';
import { TariffEntity } from './entity/tariff.entity';
import {PasswordEntity} from "./entity/password.entity";
import {PasswordRepository} from "./repository/password.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CardEntity,
      ClientEntity,
      TariffEntity,
      PasswordEntity,
    ]),
    DateModule,
  ],
  controllers: [AccountController],
  providers: [
    AccountRepositoryProvider,
    ClientRepository,
    CardRepository,
    PasswordRepository,
    AccountUsecase,
  ],
  exports: [AccountRepositoryProvider],
})
export class AccountModule {}