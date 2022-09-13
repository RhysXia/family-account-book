import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { CategoryEntity } from '../entity/CategoryEntity';
import { Pagination } from '../graphql/graphql';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class CategoryService {
  constructor(private readonly dataSource: DataSource) {}

  async findAllByIds(ids: Array<number>) {
    return await this.dataSource.manager.find(CategoryEntity, {
      where: {
        id: In(ids),
      },
    });
  }

  async findAllByAccountBookIdAndPagination(
    accountBookId: number,
    pagination: Pagination,
  ): Promise<{ total: number; data: Array<CategoryEntity> }> {
    const qb = this.dataSource
      .createQueryBuilder(CategoryEntity, 'category')
      .where('category.accountBookId = :accountBookId', { accountBookId });

    const result = await applyPagination(
      qb,
      'category',
      pagination,
    ).getManyAndCount();

    return {
      total: result[1],
      data: result[0],
    };
  }
}
