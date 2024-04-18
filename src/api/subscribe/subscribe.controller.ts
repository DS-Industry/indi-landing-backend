import {Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards} from "@nestjs/common";
import {JwtGuard} from "../../infrastructure/common/guards/jwt.guard";
import {CustomHttpException} from "../../infrastructure/common/exceptions/custom-http.exception";
import {CreateSubscribeDto} from "./dto/create-subscribe.dto";
import {SubscribeUsecase} from "../../aplication/usecases/subscribe/subscribe.usecase";
import {ReplenishmentDto} from "./dto/replenishment.dto";
import {CheckOrderDto} from "../order/dto/check-order.dto";
import {CheckSubDto} from "./dto/check-sub.dto";

@Controller('subscribe')
export class SubscribeController {
    constructor(private readonly subscribeUsecase: SubscribeUsecase) {}

    @UseGuards(JwtGuard)
    @Post('/create')
    @HttpCode(200)
    async addSubscribeClient(@Body() body: CreateSubscribeDto, @Request() req: any): Promise<any> {
        try {
            const { user } = req;

            return await this.subscribeUsecase.create(body, user);

        } catch (e) {
            throw new CustomHttpException({
                message: e.message,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }

    @Post('/replenishment')
    @HttpCode(200)
    async replenishment(@Request() req: any): Promise<any> {
        try {
            const  subscription: ReplenishmentDto  = {
                subscribeId: req.body.payload.subscription.entity.id,
                dateDebiting: new Date (req.body.payload.subscription.entity.current_end*1000),
                status: req.body.payload.subscription.entity.status,
                payId: req.body.payload.payment.entity.id,
                amount: req.body.payload.payment.entity.amount/100,
            }
            console.log(subscription.subscribeId);
            console.log(subscription.status);
            console.log(subscription.payId);
            console.log(subscription.amount);
            console.log('test ' + subscription.dateDebiting)
            return await this.subscribeUsecase.replenishment(subscription)

        } catch (e) {
            throw new CustomHttpException({
                message: e.message,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }

    @Get('/plans')
    @HttpCode(201)
    async getAllPlans(): Promise<any> {
        try {
            const data = await this.subscribeUsecase.getAllPlans();
            return data.items.map(item => {
                const roundedPrice = Math.ceil(item.item.amount / 60);
                let roundedPriceStr = roundedPrice.toString();
                roundedPriceStr = roundedPriceStr.slice(0, -1) + '0';
                const fullPrice = parseFloat(roundedPriceStr);
                return {
                    id: item.id,
                    name: item.item.name,
                    amount: item.item.amount,
                    fullPrice: fullPrice,
                };
            });
        } catch (e) {
            throw new CustomHttpException({
                message: e.message,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }

    @Get('/subInfo')
    @UseGuards(JwtGuard)
    @HttpCode(201)
    async getSubscribeInfo(@Request() req: any): Promise<any>{
        try {
            const { user } = req;

            return await this.subscribeUsecase.getSubscribeInfo(user);
        } catch (e) {
            throw new CustomHttpException({
                message: e.message,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }

    @Post('/cancellation')
    @UseGuards(JwtGuard)
    @HttpCode(200)
    async cancellation(@Request() req: any): Promise<any>{
        try {
            const { user } = req;

            return await this.subscribeUsecase.cancellation(user);
        } catch (e) {
            throw new CustomHttpException({
                message: e.message,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }

    @Post('check')
    @HttpCode(201)
    async check(@Body() data: CheckSubDto) {
        try {
            return await this.subscribeUsecase.checkSub(data);
        } catch (e) {
            throw new CustomHttpException({
                message: e.message,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }
}
