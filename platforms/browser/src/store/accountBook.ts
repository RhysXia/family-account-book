import { atom } from 'jotai';
import { AccountBook } from '../types/accountBook';

export const currentAccountBook = atom<AccountBook | null>(null);
