import { NotFoundException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { CARD_NOT_FOUND_EXCEPTION_CODE } from '../../../infrastructure/common/constants/constants';

export class CardNotFoundExceptions extends NotFoundException {
    constructor(uniqNomer: string) {
        super(
            CARD_NOT_FOUND_EXCEPTION_CODE,
            `Card number= ${uniqNomer} is not found`,
        );
    }
}