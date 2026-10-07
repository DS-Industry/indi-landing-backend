import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateBonusOperDto } from './dto/create-bonus-oper.dto';
import { Card } from 'src/domain/account/card/model/card';

interface BonusOperResponse {
  operId: number;
  cardId: number;
  balance: number;
}

@Injectable()
export class CreateCardBonusOperUseCase {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: CreateBonusOperDto, card: Card): Promise<void> {
    if (input.sum <= 0) {
      return;
    }

    const baseUrl = this.configService.get<string>('onviBackendUrl');
    const apiKey = this.configService.get<string>('onviInternalApiKey');
    if (!baseUrl || !apiKey) {
      throw new Error('ONVI_BACKEND_URL and ONVI_INTERNAL_API_KEY must be set');
    }

    const response = await firstValueFrom(
      this.httpService.post<BonusOperResponse>(
        `${baseUrl.replace(/\/+$/, '')}/internal/card/bonus-oper`,
        {
          cardId: card.cardId,
          typeOperId: input.typeOperId,
          sum: input.sum,
          operDate: input.operDate.toISOString(),
          lotExpiryAt: null,
          lotFundingType: 'PURCHASED'
        },
        {
          headers: { 'x-internal-api-key': apiKey },
          timeout: 10000,
        },
      ),
    );

    card.balance = response.data.balance;
  }
}
