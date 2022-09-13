import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { CategoryEntity, CategoryType } from '../entity/CategoryEntity';
import { UserEntity } from '../entity/UserEntity';
import { ResourceNotFoundException } from '../exception/ServiceException';
import { Pagination } from '../graphql/graphql';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class CategoryService {
  constructor(private readonly dataSource: DataSource) {}

  async delete(id: number, user: UserEntity) {
    return this.dataSource.manager.transaction(async (manager) => {
      const category = await manager
        .createQueryBuilder(CategoryEntity, 'category')
        .leftJoin('category.accountBook', 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('category.id = :id', {
          id,
        })
        .andWhere('admin.id = :adminId OR member.id = :memberId', {
          adminId: user.id,
          memberId: user.id,
        })
        .getOne();

      if (!category) {
        throw new ResourceNotFoundException('分类不存在');
      }

      return manager.remove(category);
    });
  }

  update(
    id: number,
    {
      name,
      desc,
    }: {
      name?: string;
      desc?: string;
    },
    user: UserEntity,
  ) {
    return this.dataSource.manager.transaction(async (manager) => {
      const category = await manager
        .createQueryBuilder(CategoryEntity, 'category')
        .leftJoin('category.accountBook', 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('category.id = :id', {
          id,
        })
        .andWhere('admin.id = :adminId OR member.id = :memberId', {
          adminId: user.id,
          memberId: user.id,
        })
        .getOne();

      if (!category) {
        throw new ResourceNotFoundException('分类不存在');
      }

      if (name) {
        category.name = name;
      }

      if (desc) {
        category.desc = desc;
      }

      category.updater = user;

      return manager.save(category);
    });
  }

  async create(
    {
      name,
      desc,
      type,
      accountBookId,
    }: {
      name: string;
      desc?: string;
      type: CategoryType;
      accountBookId: number;
    },
    user: UserEntity,
  ) {
    return this.dataSource.manager.transaction(async (manager) => {
      const accountBook = await manager
        .createQueryBuilder(AccountBookEntity, 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('accountBook.id = :id', {
          id: accountBookId,
        })
        .andWhere('admin.id = :adminId OR member.id = :memberId', {
          adminId: user.id,
          memberId: user.id,
        })
        .getOne();

      if (!accountBook) {
        throw new ResourceNotFoundException('账本不存在');
      }

      const category = new CategoryEntity();
      category.name = name;
      category.desc = desc;
      category.type = type;
      category.accountBook = accountBook;

      category.creator = user;
      category.updater = user;

      return manager.save(category);
    });
  }

  async findAllByIds(ids: Array<number>) {
    return await this.dataSource.manager.find(CategoryEntity, {
      where: {
        id: In(ids),
      },
    });
  }

  async findAllByAccountBookIdAndPagination(
    accountBookId: number,
    pagination?: Pagination,
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
