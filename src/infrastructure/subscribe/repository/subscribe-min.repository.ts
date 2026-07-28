import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISubscribeMinRepository } from '../../../domain/subscribe/interface/subscribe-min-repository.interface';
import { SubscribeMin } from '../../../domain/subscribe/model/subscribe-min.model';
import { SubscribeMinEntity } from '../entity/subscribe-min.entity';

@Injectable()
export class SubscribeMinRepository implements ISubscribeMinRepository {
  constructor(
    @InjectRepository(SubscribeMinEntity)
    private readonly subscribeMinRepository: Repository<SubscribeMinEntity>,
  ) {}

  async getAll(): Promise<SubscribeMin[]> {
    const items = await this.subscribeMinRepository.find();
    return items.map((item) => SubscribeMin.fromEntity(item));
  }

  async findBySumMoney(sumMoney: number): Promise<SubscribeMin> {
    const item = await this.subscribeMinRepository.findOne({
      where: { sumMoney },
    });

    if (!item) return null;

    return SubscribeMin.fromEntity(item);
  }
}
