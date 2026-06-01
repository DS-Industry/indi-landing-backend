export type CardType = 'VIRTUAL' | 'PHYSICAL';

export interface ICreateCardDto {
  clientPhysicalId: number;
  nomer: string;
  devNomer: string;
  cardType: CardType;
  beginDate: Date;
  monthLimit?: number | null;
  cardTierId?: number | null;
}
