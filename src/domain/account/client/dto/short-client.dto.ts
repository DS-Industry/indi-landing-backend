import { Card } from '../../card/model/card';
import { ShortCardDto } from '../../card/dto/short-card.dto';
import {Subscribe} from "../../../subscribe/model/subscribe.model";
import {InfoSubscribeDto} from "./info-subscribe.dto";

export interface ShortClientDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: Date;
  refreshToken: string;
  invitedFriends: string[];
  cards: ShortCardDto;
}
