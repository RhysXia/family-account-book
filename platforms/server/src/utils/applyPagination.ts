import { SelectQueryBuilder } from 'typeorm';
import { Pagination } from '../graphql/graphql';

export const applyPagination = <T>(
  builder: SelectQueryBuilder<T>,
  tableName: string,
  pagination: Pagination | null | undefined,
) => {
  if (!pagination) {
    return builder;
  }

  if (Number.isInteger(pagination.limit)) {
    builder.limit(pagination.limit as number);
  }

  if (Number.isInteger(pagination.offset)) {
    builder.offset(pagination.offset as number);
  }

  const orderBy = pagination.orderBy;

  if (!orderBy) {
    return builder;
  }

  orderBy.forEach((order, index) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore

    builder[index > 0 ? 'andOrderBy' : 'orderBy'](
      `${tableName}.${order.field}`,
      order.direction,
    );
  });

  return builder;
};
