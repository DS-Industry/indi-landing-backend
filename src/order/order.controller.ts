import {Body, Controller, HttpCode, Post} from "@nestjs/common";
import {OrderService} from "./order.service";

@Controller('order')
export class OrderController{
    constructor(private readonly orderService: OrderService) {}

    @Post('create')
    @HttpCode(201)
    async create(@Body() amount: { amount: number }){
        try {
            const orderId = await this.orderService.create(amount.amount);
            console.log(orderId)
            return { orderId };
        } catch (err){
            console.log(err)
        }
    }

}