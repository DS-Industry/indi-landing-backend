export interface BurnablePointDto {
  sum: number;
  burnDate: Date | null;
}

export interface ShortCardDto {
  number: string;
  unqNumber: string;
  balance: number;
  isLocked: number;
  dateBegin: Date;
  burnablePoints?: BurnablePointDto[];
}
