import { atom } from 'jotai';
import { User } from '../types/user';

export const storeCurrentUser = atom<User | null>(null);
