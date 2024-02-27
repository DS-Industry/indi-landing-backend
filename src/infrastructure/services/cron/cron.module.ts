import {Module} from "@nestjs/common";
import {CronService} from "./cron.service";
import {SubscribeModule} from "../../subscribe/subscribe.module";

@Module({
    imports: [SubscribeModule],
    providers: [CronService],
})
export class CronModule {}