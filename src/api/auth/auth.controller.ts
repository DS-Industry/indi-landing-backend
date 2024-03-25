import {Body, Controller, HttpCode, HttpStatus, Post, Req, Request, UseGuards,} from '@nestjs/common';
import {AuthUsecase} from '../../aplication/usecases/auth/auth.usecase';
import {LoginRequestDto} from './dto/login-request.dto';
import {LocalGuard} from '../../infrastructure/common/guards/local.guard';
import {LoginResponseDto} from './dto/response/login-response.dto';
import {AuthType} from '../../domain/auth/enums/auth-type.enum';
import {RegisterResponseDto} from './dto/response/register-response.dto';
import {RegisterRequestDto} from './dto/register-request.dto';
import {InvalidPasswordException} from '../../domain/auth/exceptions/invalid-password.exception';
import {AccountNotFoundExceptions} from '../../domain/account/exceptions/account-not-found.exceptions';
import {RefreshGuard} from '../../infrastructure/common/guards/refresh.guard';
import {RefreshResponseDto} from './dto/response/refresh-response.dto';
import {CustomHttpException} from '../../infrastructure/common/exceptions/custom-http.exception';
import {OtpRequestDto} from "./dto/otp-request.dto";
import {OtpInternalExceptions} from "../../domain/otp/exceptions/otp-internal.exceptions";
import {OtpResponseDto} from "./dto/response/otp-response.dto";
import {OtpStatus} from "../../domain/otp/enums/otp-status.enum";
import {ChangePasswordOtpRequestDto} from "./dto/change-password-otp-request.dto";
import {ChangePasswordRequestDto} from "./dto/change-password-request.dto";
import {InvalidOtpException} from "../../domain/auth/exceptions/invalid-otp.exception";
import {ChangePasswordResponseDto} from "./dto/response/change-password-response.dto";
import {ChangePassword} from "../../domain/account/password/enums/change-password.enum";

@Controller('auth')
export class AuthController {
  constructor(private readonly authUsecase: AuthUsecase) {}

  @UseGuards(LocalGuard)
  @HttpCode(200)
  @Post('/login')
  async login(@Body() auth: LoginRequestDto, @Request() req: any) {
    try {
      const { user } = req;
      if (user.register) {
        return new LoginResponseDto({
          client: null,
          tokens: null,
          type: AuthType.REGISTER_REQUIRED,
        });
      }
      const accessToken = await this.authUsecase.signAccessToken(auth.phone);
      const refreshToken = await this.authUsecase.signRefreshToken(auth.phone);
      await this.authUsecase.setCurrentRefreshToken(
        auth.phone,
        refreshToken.token,
      );

      const shortUser = user.getAccountInfo();
      delete shortUser['refreshToken'];

      return new LoginResponseDto({
        client: shortUser,
        tokens: {
          accessToken: accessToken.token,
          accessTokenExp: accessToken.expirationDate,
          refreshToken: refreshToken.token,
          refreshTokenExp: refreshToken.expirationDate,
        },
        type: AuthType.LOGIN_SUCCESS,
      });
    } catch (e) {
      throw new CustomHttpException({
        message: e.message,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Post('/register')
  @HttpCode(201)
  async register(@Body() auth: RegisterRequestDto, @Request() req: any) {
    try {
      const { newAccount, accessToken, refreshToken } =
        await this.authUsecase.register(auth.phone, auth.uniqNomer, auth.password, auth.checkPassword, auth.otp);

      const shortUser = newAccount.getAccountInfo();
      delete shortUser['refreshToken'];
      return new RegisterResponseDto({
        client: shortUser,
        tokens: {
          accessToken: accessToken.token,
          accessTokenExp: accessToken.expirationDate,
          refreshToken: refreshToken.token,
          refreshTokenExp: refreshToken.expirationDate,
        },
        type: AuthType.REGISTER_SUCCESS,
      });
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

  @Post('/changePassword')
  @HttpCode(201)
  async changePassword(@Body() changeRequest: ChangePasswordRequestDto) {
    try {
      const phone = changeRequest.phone;
      const password = changeRequest.newPassword;
      const chPassword = changeRequest.checkNewPassword;
      const otp = changeRequest.otp;
      await this.authUsecase.changePassword(phone, password, chPassword, otp);
      return new ChangePasswordResponseDto({
        status: ChangePassword.CHANGE_SUCCESS,
        target: phone,
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
  
  @HttpCode(201)
  @Post('/register/otp')
  async sendOtp(@Body() otpRequest: OtpRequestDto) {
    try {
      const email = otpRequest.email;
      const phone = otpRequest.phone;
      const uniqNomer = otpRequest.uniqNomer;
      const otp = await this.authUsecase.regOtp(email, phone, uniqNomer);
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
      } else if (e instanceof AccountNotFoundExceptions) {
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

  @HttpCode(201)
  @Post('/changePassword/otp')
  async changePasswordOtp(@Body() changeOtpRequest: ChangePasswordOtpRequestDto) {
    try {
      const phone = changeOtpRequest.phone;
      const otp = await this.authUsecase.changePasswordOtp(phone);
      return new OtpResponseDto({
        status: OtpStatus.SENT_SUCCESS,
        target: otp.phone,
      });
    } catch (e) {
      if (e instanceof AccountNotFoundExceptions) {
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

  @HttpCode(200)
  @UseGuards(RefreshGuard)
  @Post('refresh')
  async refresh(@Body() RefreshRequestDto: any, @Req() request: any) {
    const { user } = request;
    const accessToken = await this.authUsecase.signAccessToken(
      user.correctPhone,
    );
    return new RefreshResponseDto({
      accessToken: accessToken.token,
      accessTokenExp: accessToken.expirationDate,
    });
  }
}
