export type GraphqlEntity<T> = Omit<T, 'id'> & {
  id: string;
};
