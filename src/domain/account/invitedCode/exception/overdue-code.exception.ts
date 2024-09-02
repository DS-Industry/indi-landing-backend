import {ServerException} from "../../../../infrastructure/common/exceptions/base.exceptions";
import {INVITED_OVERDUE_ERROR_CODE} from "../../../../infrastructure/common/constants/constants";

export class OverdueCodeException extends ServerException {
    constructor(invitedCode: string) {
        super(
            INVITED_OVERDUE_ERROR_CODE,
            `Code= ${invitedCode} cannot be used`,
        );
    }
}