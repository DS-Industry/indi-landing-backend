import { Injectable } from '@nestjs/common';
import {SubscribeUsecase} from "../../../aplication/usecases/subscribe/subscribe.usecase";
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronService{
    constructor(
        private readonly subscribeUsecase: SubscribeUsecase,
    ) {}

    @Cron('0 0 * * *')
    async handleCron() {
        await this.subscribeUsecase.cronZeroingOut()
    }
}
