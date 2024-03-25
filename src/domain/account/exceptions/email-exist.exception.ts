import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { EMAIL_EXISTS_CLIENT_EXCEPTION_CODE } from '../../../infrastructure/common/constants/constants';

export class EmailExistsException extends ClientException {
    constructor(email: string) {
        super(
            EMAIL_EXISTS_CLIENT_EXCEPTION_CODE,
            `Account email= ${email} already exists`,
        );
    }
}