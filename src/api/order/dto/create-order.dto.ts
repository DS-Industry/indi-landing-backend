import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderDto {
  amount: number;
}
