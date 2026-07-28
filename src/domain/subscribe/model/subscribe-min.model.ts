import { SubscribeMinEntity } from '../../../infrastructure/subscribe/entity/subscribe-min.entity';

export class SubscribeMin {
  id?: number;
  sumMoney: number;
  sumPoint: number;

  private constructor(
    sumMoney: number,
    sumPoint: number,
    {
      id,
    }: {
      id?: number;
    },
  ) {
    this.id = id;
    this.sumMoney = sumMoney;
    this.sumPoint = sumPoint;
  }

  public static fromEntity(entity: SubscribeMinEntity): SubscribeMin {
    const { id, sumMoney, sumPoint } = entity;

    return new SubscribeMin(sumMoney, sumPoint, { id });
  }
}
