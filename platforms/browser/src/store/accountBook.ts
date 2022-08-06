import { atom } from 'jotai';
import { AccountBook } from '../types/accountBook';

export const activeAccountBook = atom<AccountBook | undefined>(undefined);
