import { SubscribeMin } from '../model/subscribe-min.model';

export abstract class ISubscribeMinRepository {
  abstract getAll(): Promise<SubscribeMin[]>;
  abstract findBySumMoney(sumMoney: number): Promise<SubscribeMin>;
}
