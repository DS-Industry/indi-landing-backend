import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientEntity } from '../account/entity/client.entity';
import { CardEntity } from '../account/entity/card.entity';
import { TariffEntity } from '../account/entity/tariff.entity';
import { PasswordEntity } from '../account/entity/password.entity';
import { SubscribeEntity } from '../subscribe/entity/subscribe.entity';
import {OtpEntity} from "../otp/entity/otp.entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'oracle',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        sid: configService.get('DB_SID'),
        synchronize: false,
        entities: [
          ClientEntity,
          CardEntity,
          PasswordEntity,
          TariffEntity,
          SubscribeEntity,
          OtpEntity,
        ],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
