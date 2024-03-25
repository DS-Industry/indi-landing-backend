import {ChangePassword} from "../../../../domain/account/password/enums/change-password.enum";

export class ChangePasswordResponseDto {
    status: ChangePassword.CHANGE_SUCCESS;
    target: string;

    constructor(partial: Partial<ChangePasswordResponseDto>) {
        Object.assign(this, partial);
    }
}