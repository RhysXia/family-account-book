import { AccountBookDetail } from '@/graphql/accountBook';
import { atom } from 'jotai';
import { User } from '../types';

export const currentUserAtom = atom<User | null>(null);

export const activeAccountBookAtom = atom<AccountBookDetail | null>(null);
