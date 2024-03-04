import { ClientType } from '../enum/clinet-type.enum';
import { Card } from '../../card/model/card';
import {Password} from "../../password/model/password";
import {Subscribe} from "../../../subscribe/model/subscribe.model";

export interface ICreateClientDto {
  rawPhone: string;
  clientType: ClientType;
  refreshToken: string;
  cards?: Card[];
  password?: Password;
  subscribe?: Subscribe;
}
