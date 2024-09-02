import {ServerException} from "../../../../infrastructure/common/exceptions/base.exceptions";
import {
    INVITED_NOT_FOUND_ERROR_CODE
} from "../../../../infrastructure/common/constants/constants";

export class NotFoundCodeException extends ServerException {
    constructor(invitedCode: string) {
        super(
            INVITED_NOT_FOUND_ERROR_CODE,
            `Not found code= ${invitedCode}`,
        );
    }
}