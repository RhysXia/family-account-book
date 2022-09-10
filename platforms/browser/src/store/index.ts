import { AccountBookDetail } from '@/graphql/useGetAccountBook';
import { atom } from 'jotai';
import { User } from '../types';

export const currentUserAtom = atom<User | null>(null);

export const activeAccountBookAtom = atom<AccountBookDetail | null>(null);
