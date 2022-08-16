import { atom } from 'jotai';
import { AccountBook, User } from '../types';

export const currentUserAtom = atom<User | null>(null);

export const activeAccountBookAtom = atom<AccountBook | null>(null);
