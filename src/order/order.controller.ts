import {Body, Controller, HttpCode, Post} from "@nestjs/common";
import {OrderService} from "./order.service";
import {CheckOrderDto} from "./dto/check-order.dto";

@Controller('order')
export class OrderController{
    constructor(private readonly orderService: OrderService) {}

    @Post('create')
    @HttpCode(201)
    async create(@Body() data: { amount: number }){
        try {
            const orderId = await this.orderService.create(data.amount);
            console.log(orderId)
            return { orderId };
        } catch (err){
            console.log(err)
        }
    }

    @Post('check')
    @HttpCode(201)
    async check(@Body() data: CheckOrderDto){
        try {
            return await this.orderService.check(data);
        } catch (err){
            console.log(err)
        }
    }
}