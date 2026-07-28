import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ClientEntity } from '../account/entity/client.entity';
import { CardEntity } from '../account/entity/card.entity';
import { PasswordEntity } from '../account/entity/password.entity';
import { SubscribeEntity } from '../subscribe/entity/subscribe.entity';
import { SubscribeMinEntity } from '../subscribe/entity/subscribe-min.entity';
import { OtpEntity } from '../otp/entity/otp.entity';
import { PackEntity } from '../pack/pack/entity/pack.entity';
import { PackUsageEntity } from '../pack/pack/entity/pack-usage.entity';
import { RemainsPackEntity } from '../pack/remains/entity/remains-pack.entity';
import { InvitedCodeEntity } from '../account/entity/invitedCode.entity';
import { InvitedCodeUsageEntity } from '../account/entity/invitedCodeUsage.entity';
import { BonusOperEntity } from '../account/entity/bonus-oper.entity';
import { BonusOperTypeEntity } from '../account/entity/bonus-oper-type.entity';
import { resolvePostgresSsl } from './postgres-ssl';

const entities = [
  ClientEntity,
  CardEntity,
  PasswordEntity,
  InvitedCodeEntity,
  InvitedCodeUsageEntity,
  SubscribeEntity,
  SubscribeMinEntity,
  OtpEntity,
  PackEntity,
  PackUsageEntity,
  RemainsPackEntity,
  BonusOperEntity,
  BonusOperTypeEntity,
];

export function buildTypeOrmPostgresOptions(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const databaseUrl = configService.get<string>('DATABASE_URL')?.trim();
  const base: TypeOrmModuleOptions = {
    type: 'postgres',
    synchronize: false,
    entities,
  };

  if (databaseUrl) {
    return {
      ...base,
      url: databaseUrl,
      ssl: resolvePostgresSsl(configService, databaseUrl),
    };
  }

  return {
    ...base,
    host: configService.get<string>('DB_HOST') || configService.get<string>('POSTGRES_HOST'),
    port: Number(configService.get('DB_PORT') || configService.get('POSTGRES_PORT')),
    username:
      configService.get<string>('DB_USERNAME') ||
      configService.get<string>('POSTGRES_USER'),
    password:
      configService.get<string>('DB_PASSWORD') ||
      configService.get<string>('POSTGRES_PASSWORD'),
    database:
      configService.get<string>('DB_DATABASE') ||
      configService.get<string>('POSTGRES_DATABASE'),
    ssl: resolvePostgresSsl(configService),
  };
}
