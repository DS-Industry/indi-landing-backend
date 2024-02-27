import {Module} from "@nestjs/common";
import {OrderController} from "../../api/order/order.controller";
import {OrderUsecase} from "../../aplication/usecases/order/order.usecase";
import { HttpModule } from '@nestjs/axios';

@Module({
    imports:[HttpModule],
    controllers: [OrderController],
    providers: [OrderUsecase],
    exports: [OrderUsecase],
})
export class OrderModule{}