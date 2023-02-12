import { SelectQueryBuilder } from 'typeorm';
import { ParameterException } from '../exception/ServiceException';
import { Pagination } from '../graphql/graphql';

const REGEX = /^(\w+)\.(\w+)$/;

export const applyPagination = <T>(
  builder: SelectQueryBuilder<T>,
  tableName: string,
  pagination: Pagination | null | undefined,
  leftJoin: Array<{
    alias: string;
    relation?: string;
  }> = [],
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

  const matched = new Set<string>();

  orderBy.forEach((order, index) => {
    const { field, direction } = order;

    const arr = field.match(REGEX);

    console.log(arr);

    if (arr) {
      const leftJoinTable = arr[1];
      const leftJoinField = arr[2];

      const obj = leftJoin.find((it) => it.alias === leftJoinTable);

      if (!obj) {
        throw new ParameterException(
          `不支持的排序条件：${JSON.stringify(order)}`,
        );
      }

      const { alias, relation } = obj;

      if (relation && !matched.has(alias)) {
        builder.leftJoin(relation, alias);
        matched.add(alias);
      }

      builder[index > 0 ? 'addOrderBy' : 'orderBy'](
        `${alias}.${leftJoinField}`,
        direction,
      );
      return;
    }

    builder[index > 0 ? 'addOrderBy' : 'orderBy'](
      `${tableName}.${order.field}`,
      direction,
    );
  });

  return builder;
};
