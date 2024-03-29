import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthUsecase } from '../../aplication/usecases/auth/auth.usecase';
import { AccountModule } from '../account/account.module';
import { BcryptModule } from '../services/bcrypt/bcrypt.module';
import { EnvConfigModule } from '../config/env-config/env-config.module';
import { JwtProvider } from '../services/jwt/jwt.provider';
import { AuthController } from '../../api/auth/auth.controller';
import { LocalStrategy } from '../common/strategies/local.strategy';
import { JwtRefreshStrategy } from '../common/strategies/jwt-refresh.strategy';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import {DateModule} from "../services/date/date.module";
import {OtpModule} from "../otp/otp.module";

@Module({
  imports: [
    JwtModule,
    AccountModule,
    EnvConfigModule,
    BcryptModule,
    DateModule,
    OtpModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthUsecase,
    JwtProvider,
    LocalStrategy,
    JwtRefreshStrategy,
    JwtStrategy,
  ],
  exports: [AuthUsecase],
})
export class AuthModule {}
