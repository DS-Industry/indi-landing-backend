import {OrderException} from "../../../infrastructure/common/exceptions/base.exceptions";
import {ORDER_PROCESSING_ERROR_CODE} from "../../../infrastructure/common/constants/constants";

export class InvalidAmountException extends OrderException {
    constructor(amount: number) {
        super(
            ORDER_PROCESSING_ERROR_CODE,
            `Order invalid amount: ${amount}`,
        );
    }
}