import { atom } from 'jotai';
import { AccountBook } from '../types/accountBook';

export const activeAccountBook = atom<AccountBook | undefined>(undefined);
export const accountBooks = atom<Array<AccountBook> | undefined>(undefined);
