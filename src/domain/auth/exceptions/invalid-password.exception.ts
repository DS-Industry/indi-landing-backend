import { AuthenticationException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { INVALID_PASSWORD_AUTHENTIFICATION_ERROR_CODE } from '../../../infrastructure/common/constants/constants';

export class InvalidPasswordException extends AuthenticationException {
  constructor(phone: string) {
    super(
        INVALID_PASSWORD_AUTHENTIFICATION_ERROR_CODE,
      `Client ${phone} invalid password`,
    );
  }
}
