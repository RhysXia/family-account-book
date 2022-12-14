export type PaginationResult<T> = {
  total: number;
  data: Array<T>;
};

export type Direction = 'DESC' | 'ASC';

export type Pagination = {
  limit?: number;
  offset?: number;
  orderBy?: Array<{
    field: string;
    direction: Direction;
  }>;
};

export type User = {
  id: string;
  nickname: string;
  username: string;
  email?: string;
  avatar?: string;
};

export type AccountBook = {
  id: string;
  name: string;
  desc?: string;
  createdAt: string;
  updatedAt: string;
};

export type SavingAccount = {
  id: string;
  name: string;
  desc?: string;
  createdAt: string;
  updatedAt: string;
  amount: number;
};

export enum CategoryType {
  POSITIVE_AMOUNT = 'POSITIVE_AMOUNT',
  NEGATIVE_AMOUNT = 'NEGATIVE_AMOUNT',
  POSITIVE_OR_NEGATIVE_AMOUNT = 'POSITIVE_OR_NEGATIVE_AMOUNT',
}

export interface Category {
  id: string;
  name: string;
  desc?: string;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
}

export type Tag = {
  id: string;
  name: string;
  desc?: string;
  createdAt: string;
  updatedAt: string;
};

export type FlowRecord = {
  id: string;
  desc?: string;
  createdAt: string;
  updatedAt: string;
  dealAt: string;
  creator: User;
  updater: User;
  amount: number;
};

export type DateGroupBy = 'YEAR' | 'MONTH' | 'DAY';

export type TransferRecord = {
  id: string;
  desc?: string;
  createdAt: string;
  updatedAt: string;
  dealAt: string;
  amount: number;
};
