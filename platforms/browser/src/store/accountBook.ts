import { atom } from 'jotai';
import { AccountBook } from '../types/accountBook';

export const storeActiveAccountBookId = atom<number | undefined>(undefined);

export const storeAccountBooks = atom<Array<AccountBook> | undefined>(
  undefined,
);

export const storeActiveAccountBook = atom<AccountBook | undefined>((get) =>
  get(storeAccountBooks)?.find((it) => it.id === get(storeActiveAccountBookId)),
);
