import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity } from './entity/card.entity';
import { ClientEntity } from './entity/client.entity';
import { AccountRepositoryProvider } from './provider/account-repository.provider';
import { ClientRepository } from './repository/client.repository';
import { CardRepository } from './repository/card.repository';
import { AccountController } from '../../api/account/account.controller';
import { AccountUsecase } from '../../aplication/usecases/account/account.usecase';
import {PasswordEntity} from "./entity/password.entity";
import {PasswordRepository} from "./repository/password.repository";
import {SubscribeEntity} from "../subscribe/entity/subscribe.entity";
import {DateModule} from "../services/date/date.module";
import {OtpModule} from "../otp/otp.module";
import {BcryptModule} from "../services/bcrypt/bcrypt.module";
import {InvitedCodeRepository} from "./repository/invitedCode.repository";
import {InvitedCodeEntity} from "./entity/invitedCode.entity";
import {InvitedCodeUsageEntity} from "./entity/invitedCodeUsage.entity";
import { BonusOperEntity } from './entity/bonus-oper.entity';
import { BonusOperTypeEntity } from './entity/bonus-oper-type.entity';
import { CreateCardBonusOperUseCase } from 'src/aplication/usecases/bonus/create-card-bonus-oper.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CardEntity,
      ClientEntity,
      PasswordEntity,
      SubscribeEntity,
      InvitedCodeEntity,
      InvitedCodeUsageEntity,
      BonusOperEntity,
      BonusOperTypeEntity,
    ]),
    DateModule,
    OtpModule,
    BcryptModule,
  ],
  controllers: [AccountController],
  providers: [
    AccountRepositoryProvider,
    ClientRepository,
    CardRepository,
    PasswordRepository,
    InvitedCodeRepository,
    AccountUsecase,
    CreateCardBonusOperUseCase
  ],
  exports: [AccountRepositoryProvider, CardRepository, CreateCardBonusOperUseCase],
})
export class AccountModule {}
