import { atom } from 'jotai';
import { User } from '../types/user';

export const currentUser = atom<User>(null);
