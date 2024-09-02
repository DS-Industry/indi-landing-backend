export interface ICreateInvitedCodeDto {
    clientId: number;
    invitedCode: string;
    maxInvited: number;
    pointToOwner: number;
    pointToUser: number;
}