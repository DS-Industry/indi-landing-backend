import { Module } from '@nestjs/common';
import { SubscribeController } from '../../api/subscribe/subscribe.controller';
import { SubscribeUsecase } from '../../aplication/usecases/subscribe/subscribe.usecase';
import { SubscribeRepositoryProvider } from './provider/subscribe-repository.provider';
import { SubscribeMinRepositoryProvider } from './provider/subscribe-min-repository.provider';
import { SubscribeRepository } from './repository/subscribe.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscribeEntity } from './entity/subscribe.entity';
import { SubscribeMinEntity } from './entity/subscribe-min.entity';
import { AccountModule } from '../account/account.module';
import {PackModule} from "../pack/pack/pack.module";
import { BonusOperEntity } from '../account/entity/bonus-oper.entity';
import { BonusOperTypeEntity } from '../account/entity/bonus-oper-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscribeEntity, SubscribeMinEntity, BonusOperEntity, BonusOperTypeEntity]), AccountModule, PackModule],
  controllers: [SubscribeController],
  providers: [
    SubscribeUsecase,
    SubscribeRepository,
    SubscribeRepositoryProvider,
    SubscribeMinRepositoryProvider,
  ],
  exports: [SubscribeRepositoryProvider, SubscribeMinRepositoryProvider, SubscribeUsecase],
})
export class SubscribeModule {}
