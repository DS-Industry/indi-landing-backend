import { of } from 'rxjs';
import { CreateCardBonusOperUseCase } from './create-card-bonus-oper.use-case';

describe('CreateCardBonusOperUseCase', () => {
  const operDate = new Date('2026-09-22T10:00:00Z');
  let post: jest.Mock;
  let config: Record<string, string | undefined>;
  let useCase: CreateCardBonusOperUseCase;

  beforeEach(() => {
    post = jest.fn(() =>
      of({ data: { operId: 1, cardId: 218923, balance: 760 } }),
    );
    config = {
      onviBackendUrl: 'https://api.example.test/',
      onviInternalApiKey: 'secret',
    };
    useCase = new CreateCardBonusOperUseCase(
      { post } as any,
      { get: (key: string) => config[key] } as any,
    );
  });

  it('sends the operation to the backend and keeps the card balance in step', async () => {
    const card = { cardId: 218923, balance: 160 } as any;

    await useCase.execute({ typeOperId: 6, operDate, sum: 600 }, card);

    expect(post).toHaveBeenCalledWith(
      'https://api.example.test/internal/card/bonus-oper',
      {
        cardId: 218923,
        typeOperId: 6,
        sum: 600,
        operDate: operDate.toISOString(),
        lotExpiryAt: null,
      },
      { headers: { 'x-internal-api-key': 'secret' }, timeout: 10000 },
    );
    expect(card.balance).toBe(760);
  });

  it('skips a zero or negative sum instead of failing the caller', async () => {
    await useCase.execute({ typeOperId: 5, operDate, sum: 0 }, {
      cardId: 1,
      balance: 0,
    } as any);

    expect(post).not.toHaveBeenCalled();
  });

  it('refuses to run without the backend settings', async () => {
    config.onviInternalApiKey = undefined;

    await expect(
      useCase.execute({ typeOperId: 6, operDate, sum: 10 }, {
        cardId: 1,
        balance: 0,
      } as any),
    ).rejects.toThrow('ONVI_BACKEND_URL and ONVI_INTERNAL_API_KEY must be set');
  });
});
