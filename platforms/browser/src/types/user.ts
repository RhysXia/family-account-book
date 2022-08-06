export type User = {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
};

export type SearchUser = {
  id: number;
  username: string;
  avatar?: string;
};
