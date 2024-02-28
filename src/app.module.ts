import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '../config/configuration';
import * as process from 'process';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AccountModule } from './infrastructure/account/account.module';
import { JwtModule } from './infrastructure/services/jwt/jwt.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { DateModule } from './infrastructure/services/date/date.module';
import { EnvConfigModule } from './infrastructure/config/env-config/env-config.module';
import { BcryptModule } from './infrastructure/services/bcrypt/bcrypt.module';
import { SubscribeModule } from './infrastructure/subscribe/subscribe.module';
import { CronModule } from './infrastructure/services/cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { OrderModule } from './infrastructure/order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `config/env/.env.${process.env.NODE_ENV}`,
      load: [configuration],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PassportModule.register({}),
    DatabaseModule,
    AccountModule,
    SubscribeModule,
    JwtModule,
    AuthModule,
    DateModule,
    EnvConfigModule,
    BcryptModule,
    CronModule,
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
