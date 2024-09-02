import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch, Post,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountUsecase } from '../../aplication/usecases/account/account.usecase';
import { JwtGuard } from '../../infrastructure/common/guards/jwt.guard';
import { CustomHttpException } from '../../infrastructure/common/exceptions/custom-http.exception';
import { AccountNotFoundExceptions } from '../../domain/account/exceptions/account-not-found.exceptions';
import { UpdateAccountDto } from '../../aplication/usecases/account/dto/update-account.dto';
import {OtpStatus} from "../../domain/otp/enums/otp-status.enum";
import {OtpInternalExceptions} from "../../domain/otp/exceptions/otp-internal.exceptions";
import {ChangePasswordRequestDto} from "./dto/change-password-request.dto";
import {OtpResponseDto} from "./dto/otp-response.dto";

import {ChangePassword} from "../../domain/account/password/enums/change-password.enum";
import {ChangePasswordResponseDto} from "./dto/change-password-response.dto";
import {InvalidOtpException} from "../../domain/auth/exceptions/invalid-otp.exception";
import {InvalidPasswordException} from "../../domain/auth/exceptions/invalid-password.exception";


@Controller('account')
export class AccountController {
  constructor(private readonly accountUsecase: AccountUsecase) {}

  @UseGuards(JwtGuard)
  @Get('/me')
  @HttpCode(200)
  async getCurrentAccount(@Request() req: any): Promise<any> {
    try {
      const { user } = req;

      const client = user.getAccountInfo();
      client.email = await this.accountUsecase.getEmail(user);
      client.invitedFriends = await this.accountUsecase.getAllInviteUsageClientByCodeId(user);
      return client;
    } catch (e) {
      throw new CustomHttpException({
        message: e.message,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @UseGuards(JwtGuard)
  @Get('/invited')
  @HttpCode(200)
  async getInvitedCode(@Request() req: any): Promise<any> {
    try {
      const { user } = req;
      console.log(user)

      return await this.accountUsecase.getInvitedCode(user);
    } catch (e) {
      throw new CustomHttpException({
        message: e.message,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @UseGuards(JwtGuard)
  @Get('/tariff')
  @HttpCode(200)
  async getAccountNotifications(@Req() request: any): Promise<any> {
    try {
      const { user } = request;
      return await this.accountUsecase.getCardTariff(user);
    } catch (e) {
      if (e instanceof AccountNotFoundExceptions) {
        throw new CustomHttpException({
          type: e.type,
          innerCode: e.innerCode,
          message: e.message,
          code: HttpStatus.NOT_FOUND,
        });
      } else {
        throw new CustomHttpException({
          message: e.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }

  @UseGuards(JwtGuard)
  @Post('/changePassword')
  @HttpCode(201)
  async changePassword(@Body() changeRequest: ChangePasswordRequestDto, @Req() req: any) {
    const { user } = req;
    try {
      const password = changeRequest.newPassword;
      const chPassword = changeRequest.checkNewPassword;
      const otp = changeRequest.otp;
      await this.accountUsecase.changePassword(user, password, chPassword, otp);
      return new ChangePasswordResponseDto({
        status: ChangePassword.CHANGE_SUCCESS,
        target: user.phone,
      })
    } catch (e) {
      if (e instanceof InvalidPasswordException) {
        throw new CustomHttpException({
          type: e.type,
          innerCode: e.innerCode,
          message: e.message,
          code: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      } else if (e instanceof InvalidOtpException) {
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

  @UseGuards(JwtGuard)
  @Post('/changePassword/otp')
  @HttpCode(201)
  async changePasswordOtp(@Req() req: any) {
    const { user } = req;
    try {
      const otp = await this.accountUsecase.changePasswordOtp(user);
      return new OtpResponseDto({
        status: OtpStatus.SENT_SUCCESS,
        target: otp.phone,
      });
    } catch (e) {
      if (e instanceof OtpInternalExceptions) {
        throw new CustomHttpException({
          type: e.type,
          innerCode: e.innerCode,
          message: e.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      } else {
        throw new CustomHttpException({
          message: e.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }

  @Patch()
  @UseGuards(JwtGuard)
  async updateAccountInfo(@Body() body: UpdateAccountDto, @Req() req: any) {
    const { user } = req;

    try {
      return await this.accountUsecase.updateAccountInfo(body, user);
    } catch (e: any) {
      console.log(e);
      if (e instanceof AccountNotFoundExceptions) {
        throw new CustomHttpException({
          type: e.type,
          innerCode: e.innerCode,
          message: e.message,
          code: HttpStatus.NOT_FOUND,
        });
      } else {
        throw new CustomHttpException({
          message: e.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }
}
