import { PassportStrategy } from '@nestjs/passport';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthUsecase } from '../../../aplication/usecases/auth/auth.usecase';
import { Strategy } from 'passport-local';
import { InvalidPasswordException } from '../../../domain/auth/exceptions/invalid-password.exception';
import { Client } from '../../../domain/account/client/model/client';
import { CustomHttpException } from '../exceptions/custom-http.exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthUsecase) {
    super({
      usernameField: 'phone',
      passwordField: 'password',
    });
  }

  async validate(
    phone: string,
    password: string,
    done: (error: Error, data) => Record<string, unknown>,
  ) {
    try {
      const client: Client =
        await this.authService.validateUserForLocalStrategy(phone, password);

      console.log(client);
      if (!client) {
        return done(null, { register: true });
      }

      return done(null, client);
    } catch (e) {
      if (e instanceof InvalidPasswordException) {
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
}
