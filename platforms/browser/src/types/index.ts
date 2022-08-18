export type PaginationResult<T> = {
  total: number;
  data: Array<T>;
};

export type User = {
  id: number;
  nickname: string;
  username: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
};

export type AccountBook = {
  id: number;
  name: string;
  desc?: string;
  createdAt: string;
  updatedAt: string;
};

export type SavingAccount = {
  id: number;
  name: string;
  desc?: string;
  createdAt: string;
  updatedAt: string;
  amount: number;
};

export enum TagType {
  INCOME = 'INCOME',
  EXPENDITURE = 'EXPENDITURE',
  INVESTMENT = 'INVESTMENT',
  LOAD = 'LOAD',
}

export type Tag = {
  id: number;
  name: string;
  type: TagType;
  createdAt: string;
  updatedAt: string;
};

export type FlowRecord = {
  id: number;
  desc?: string;
  createdAt: string;
  updatedAt: string;
  dealAt: Date;
  creator: User;
  updater: User;
  amount: number;
};
