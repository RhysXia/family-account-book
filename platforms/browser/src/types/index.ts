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

/**
 * 分类类型
 */
export enum CategoryType {
  /**
   * 收入
   */
  INCOME = 'INCOME',
  /**
   * 支出
   */
  EXPENDITURE = 'EXPENDITURE',

  /**
   * 不确定
   */
  UNKNOWN = 'UNKNOWN',
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
  createdBy: User;
  updatedBy: User;
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
