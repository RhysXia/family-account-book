import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { CategoryEntity, CategoryType } from '../entity/CategoryEntity';
import { FlowRecordEntity } from '../entity/FlowRecordEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { TagEntity } from '../entity/TagEntity';
import { UserEntity } from '../entity/UserEntity';
import {
  InternalException,
  ParameterException,
  ResourceNotFoundException,
} from '../exception/ServiceException';
import { Pagination } from '../graphql/graphql';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class CategoryService {
  constructor(private readonly dataSource: DataSource) {}

  async findByTagId(tagId: number) {
    const tag = await this.dataSource.manager.findOne(TagEntity, {
      relations: { category: true },
      where: {
        id: tagId,
      },
    });

    if (!tag) {
      return;
    }

    return tag.category;
  }

  async findByIdsAndUserId(
    ids: Array<number>,
    userId: number,
  ): Promise<Array<CategoryEntity>> {
    return this.dataSource
      .createQueryBuilder(CategoryEntity, 'category')
      .leftJoin('category.accountBook', 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('category.id IN (:...ids)', { ids })
      .andWhere('admin.id = :adminId OR member.id = :memberId', {
        adminId: userId,
        memberId: userId,
      })
      .getMany();
  }

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
        .andWhere('admin.id = :adminId', {
          adminId: user.id,
        })
        .getOne();

      if (!category) {
        throw new ResourceNotFoundException('分类不存在');
      }

      // 回去分类下的流水总额，添加回对应账号
      const totalFlowRecordAmount = await manager
        .createQueryBuilder(FlowRecordEntity, 'flowRecord')
        .leftJoin('flowRecord.tag', 'tag')
        .select('SUM(flowRecord.amount)', 'totalAmount')
        .addSelect('flowRecord.savingAccountId', 'savingAccountId')
        .where('tag.categoryId = :categoryId', { categoryId: id })
        .groupBy('flowRecord.savingAccountId')
        .getRawMany<{ totalAmount: number; savingAccountId: number }>();

      const savingAccountIds = totalFlowRecordAmount.map(
        (it) => it.savingAccountId,
      );

      const savingAccounts = await manager.find(SavingAccountEntity, {
        where: {
          id: In(savingAccountIds),
        },
      });

      totalFlowRecordAmount.forEach((it) => {
        const savingAccount = savingAccounts.find(
          (s) => s.id === it.savingAccountId,
        );

        if (!savingAccount) {
          throw new InternalException(`账户(id: ${it.savingAccountId})不存在`);
        }

        savingAccount.amount -= it.totalAmount;

        if (savingAccount.amount < 0) {
          throw new ParameterException(
            `删除会导致账户${savingAccount.name}(id: ${savingAccount.id})余额小于0`,
          );
        }
      });

      await manager.save(savingAccounts);

      const tags = await manager.find(TagEntity, {
        where: {
          categoryId: id,
        },
      });

      await manager.delete(FlowRecordEntity, {
        tagId: In(tags.map((it) => it.id)),
      });

      await manager.delete(TagEntity, {
        id: In(tags.map((it) => it.id)),
      });

      return manager.delete(CategoryEntity, { id });
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

      category.updatedBy = user;

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

      category.createdBy = user;
      category.updatedBy = user;

      const count = await manager.count(CategoryEntity, {
        where: {
          accountBookId,
        },
      });

      category.order = count + 1;

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
    filter?: {
      type?: CategoryType;
    },
    pagination?: Pagination,
  ): Promise<{ total: number; data: Array<CategoryEntity> }> {
    const { type } = filter || {};

    const qb = this.dataSource
      .createQueryBuilder(CategoryEntity, 'category')
      .where('category.accountBookId = :accountBookId', { accountBookId });

    if (type) {
      qb.andWhere('category.type = :type', { type });
    }

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
