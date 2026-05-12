import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientEntity } from '../account/entity/client.entity';
import { CardEntity } from '../account/entity/card.entity';
import { PasswordEntity } from '../account/entity/password.entity';
import { SubscribeEntity } from '../subscribe/entity/subscribe.entity';
import {OtpEntity} from "../otp/entity/otp.entity";
import {PackEntity} from "../pack/pack/entity/pack.entity";
import {PackUsageEntity} from "../pack/pack/entity/pack-usage.entity";
import {RemainsPackEntity} from "../pack/remains/entity/remains-pack.entity";
import {InvitedCodeEntity} from "../account/entity/invitedCode.entity";
import {InvitedCodeUsageEntity} from "../account/entity/invitedCodeUsage.entity";
import { BonusOperEntity } from '../account/entity/bonus-oper.entity';
import { BonusOperTypeEntity } from '../account/entity/bonus-oper-type.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || configService.get('POSTGRES_HOST'),
        port: Number(configService.get('DB_PORT') || configService.get('POSTGRES_PORT')),
        username: configService.get('DB_USERNAME') || configService.get('POSTGRES_USER'),
        password: configService.get('DB_PASSWORD') || configService.get('POSTGRES_PASSWORD'),
        database: configService.get('DB_DATABASE') || configService.get('POSTGRES_DATABASE'),
        synchronize: false,
        entities: [
          ClientEntity,
          CardEntity,
          PasswordEntity,
          InvitedCodeEntity,
          InvitedCodeUsageEntity,
          SubscribeEntity,
          OtpEntity,
          PackEntity,
          PackUsageEntity,
          RemainsPackEntity,
          BonusOperEntity,
          BonusOperTypeEntity,
        ],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
