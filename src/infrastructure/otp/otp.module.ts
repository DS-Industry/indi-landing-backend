import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {OtpEntity} from "./entity/otp.entity";
import {HttpModule} from "@nestjs/axios";
import {OtpRepositoryProvider} from "./provider/otp-repository.provider";
import {ConfigService} from "@nestjs/config";

@Module({
    imports: [TypeOrmModule.forFeature([OtpEntity]), HttpModule],
    providers: [OtpRepositoryProvider],
    exports: [OtpRepositoryProvider],
})
export class OtpModule {}