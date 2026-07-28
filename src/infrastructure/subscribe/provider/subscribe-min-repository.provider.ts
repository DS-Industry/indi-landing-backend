import { Provider } from '@nestjs/common';
import { ISubscribeMinRepository } from '../../../domain/subscribe/interface/subscribe-min-repository.interface';
import { SubscribeMinRepository } from '../repository/subscribe-min.repository';

export const SubscribeMinRepositoryProvider: Provider = {
  provide: ISubscribeMinRepository,
  useClass: SubscribeMinRepository,
};
