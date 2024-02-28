import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrderUsecase } from '../../aplication/usecases/order/order.usecase';
import { OrderController } from '../../api/order/order.controller';

@Module({
  imports: [HttpModule],
  controllers: [OrderController],
  providers: [OrderUsecase],
})
export class OrderModule {}
