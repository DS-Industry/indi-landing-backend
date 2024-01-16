import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '../config/configuration';
import * as process from 'process';
import {OrderModule} from "./order/order.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `config/env/.env.${process.env.NODE_ENV}`,
      load: [configuration],
      isGlobal: true,
    }),
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
