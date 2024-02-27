import { ClientType } from '../enum/clinet-type.enum';
import { Card } from '../../card/model/card';
import {Password} from "../../password/model/password";

export interface ICreateClientDto {
  rawPhone: string;
  clientType: ClientType;
  refreshToken: string;
  cards?: Card[];
  password?: Password;
}
