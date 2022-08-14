export type PaginationResult<T> = {
  total: number;
  data: Array<T>;
};

export type User = {
  id: number;
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
