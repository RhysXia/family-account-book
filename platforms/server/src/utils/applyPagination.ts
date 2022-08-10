import { SelectQueryBuilder } from 'typeorm';
import { Pagination } from '../graphql/graphql';

export const applyPagination = (
  builder: SelectQueryBuilder<any>,
  tableName: string,
  pagination?: Pagination,
) => {
  if (!pagination) {
    return builder;
  }

  let sqb = builder;
  if (Number.isInteger(pagination.limit)) {
    sqb = sqb.limit(pagination.limit);
  }

  if (Number.isInteger(pagination.offset)) {
    sqb = sqb.offset(pagination.offset);
  }

  const orderBy = pagination.orderBy;
  if (!orderBy) {
    return sqb;
  }

  orderBy.forEach((order) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    sqb = sqb.orderBy(`${tableName}.${order.field}`, order.direction);
  });

  return sqb;
};
