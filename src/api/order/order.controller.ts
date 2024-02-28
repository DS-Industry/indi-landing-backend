import {Body, Controller, HttpCode, HttpStatus, Post, Request} from "@nestjs/common";
import {OrderUsecase} from "../../aplication/usecases/order/order.usecase";
import {CheckOrderDto} from "./dto/check-order.dto";
import {CreateOrderDto} from "./dto/create-order.dto";
import {InvalidAmountException} from "../../domain/order/exceptions/invalid-amount.exception";
import {CustomHttpException} from "../../infrastructure/common/exceptions/custom-http.exception";

@Controller('order')
export class OrderController{
    constructor(private readonly OrderUsecase: OrderUsecase) {}

    @Post('create')
    @HttpCode(201)
    async create(@Body() createOrder: CreateOrderDto, @Request() req: any){
        try {
            const orderId = await this.OrderUsecase.create(createOrder.amount);
            console.log('Create order' + orderId)
            return { orderId };
        } catch (e){
            if(e instanceof InvalidAmountException){
                throw new CustomHttpException({
                    type: e.type,
                    innerCode: e.innerCode,
                    message: e.message,
                    code: HttpStatus.UNPROCESSABLE_ENTITY,
                });
            } else {
                throw new CustomHttpException({
                    message: e.message,
                    code: HttpStatus.INTERNAL_SERVER_ERROR,
                });
            }
        }
    }

    @Post('check')
    @HttpCode(201)
    async check(@Body() data: CheckOrderDto){
        try {
            return await this.OrderUsecase.check(data);
        } catch (e){
            throw new CustomHttpException({
                message: e.message,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }
}