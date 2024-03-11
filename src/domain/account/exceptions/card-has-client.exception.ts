import { NotFoundException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { CARD_HAS_CLIENT_EXCEPTION_CODE } from '../../../infrastructure/common/constants/constants';

export class CardHasClientExceptions extends NotFoundException {
    constructor(uniqNomer: string) {
        super(
            CARD_HAS_CLIENT_EXCEPTION_CODE,
            `Card number= ${uniqNomer} has a client`,
        );
    }
}