import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { CategoryEntity, CategoryType } from '../entity/CategoryEntity';
import { FlowRecordEntity } from '../entity/FlowRecordEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { TagEntity } from '../entity/TagEntity';
import { UserEntity } from '../entity/UserEntity';
import { ResourceNotFoundException } from '../exception/ServiceException';
import { DateGroupBy, Pagination } from '../graphql/graphql';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class AccountBookService {
  constructor(private readonly dataSource: DataSource) {}

  async findFlowRecordTotalAmountPerCategoryById(
    {
      startDate,
      endDate,
      savingAccountId,
      tagId,
      traderId,
      categoryType,
    }: {
      endDate?: Date;
      startDate?: Date;
      savingAccountId?: number;
      tagId?: number;
      traderId?: number;
      categoryType?: CategoryType;
    },
    accountBookId: number,
  ): Promise<
    Array<{
      category: CategoryEntity;
      amount: number;
    }>
  > {
    const qb = this.dataSource.manager
      .createQueryBuilder(FlowRecordEntity, 'flowRecord')
      .select('SUM(flowRecord.amount)', 'totalAmount')
      .addSelect('category.*')
      .leftJoin('flowRecord.tag', 'tag')
      .leftJoin('tag.category', 'category')
      .groupBy('category.id')
      .where('flowRecord.accountBookId = :accountBookId', { accountBookId });

    if (tagId) {
      qb.andWhere('flowRecord.tagId = :tagId', {
        tagId,
      });
    }

    if (traderId) {
      qb.andWhere('flowRecord.traderId = :traderId', {
        traderId,
      });
    }

    if (categoryType) {
      qb.andWhere('category.type = :categoryType', { categoryType });
    }

    if (savingAccountId) {
      qb.andWhere('flowRecord.savingAccountId = :savingAccountId', {
        savingAccountId,
      });
    }

    if (startDate) {
      qb.andWhere('flowRecord.dealAt >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('flowRecord.dealAt <= :endDate', { endDate });
    }

    const ret: Array<
      CategoryEntity & {
        totalAmount: string | null;
      }
    > = await qb.getRawMany();

    return ret.map((it) => {
      const { totalAmount, ...category } = it;
      return {
        amount: +(totalAmount || 0),
        category,
      };
    });
  }

  async findFlowRecordTotalAmountPerTraderByIdAndGroupByDate(
    {
      endDate,
      startDate,
      savingAccountId,
      categoryId,
      categoryType,
      tagId,
    }: {
      endDate?: Date;
      startDate?: Date;
      savingAccountId?: number;
      tagId?: number;
      categoryId?: number;
      categoryType?: CategoryType;
    },
    accountBookId: number,
    groupBy: DateGroupBy,
  ): Promise<
    Array<{
      trader: {
        id: number;
        username: string;
        password: string;
        nickname: string;
        createdAt: Date;
        updatedAt: Date;
        email?: string;
        avatar?: string;
      };
      amountPerDate: Array<{
        dealAt: string;
        amount: number;
      }>;
    }>
  > {
    let dataFormat: string;

    switch (groupBy) {
      case DateGroupBy.YEAR: {
        dataFormat = 'YYYY';
        break;
      }
      case DateGroupBy.MONTH: {
        dataFormat = 'YYYY-MM';
        break;
      }
      case DateGroupBy.DAY: {
        dataFormat = 'YYYY-MM-DD';
        break;
      }
    }

    const qb = this.dataSource.manager
      .createQueryBuilder(FlowRecordEntity, 'flowRecord')
      .select(`to_char(flowRecord.dealAt, '${dataFormat}')`, 'deal_at')
      .addSelect('trader.*')
      .addSelect('SUM(flowRecord.amount)', 'totalAmount')
      .leftJoin('flowRecord.trader', 'trader')
      .groupBy('deal_at, trader.id')
      .where('flowRecord.accountBookId = :accountBookId', { accountBookId })
      .orderBy('deal_at', 'ASC');

    if (tagId) {
      qb.andWhere('flowRecord.tagId = :tagId', {
        tagId,
      });
    }

    if (categoryId || categoryType) {
      qb.leftJoin('flowRecord.tag', 'tag');

      if (categoryId) {
        qb.andWhere('tag.categoryId = :categoryId', { categoryId });
      }

      if (categoryType) {
        qb.leftJoin('tag.category', 'category').andWhere(
          'category.type = :categoryType',
          { categoryType },
        );
      }
    }

    if (savingAccountId) {
      qb.andWhere('flowRecord.savingAccountId = :savingAccountId', {
        savingAccountId,
      });
    }

    if (startDate) {
      qb.andWhere('flowRecord.dealAt >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('flowRecord.dealAt <= :endDate', { endDate });
    }

    const ret: Array<{
      totalAmount: string | null;
      deal_at: string;
      createdAt: Date;
      updatedAt: Date;
      id: number;
      nickname: string;
      username: string;
      password: string;
      email: string | null;
      avatar: string | null;
      deletedAt: Date | null;
    }> = await qb.getRawMany();

    const map = new Map<number, Array<{ dealAt: string; amount: number }>>();

    ret.forEach((it) => {
      const array = map.get(it.id) || [];
      array.push({ dealAt: it.deal_at, amount: +(it.totalAmount || 0) });
      map.set(it.id, array);
    });

    return Array.from(map.keys()).map((id) => {
      const { avatar, email, ...others } = ret.find((it) => it.id === id)!;
      return {
        amountPerDate: map.get(id)!,
        trader: {
          ...others,
          ...(avatar && { avatar }),
          ...(email && { email }),
        },
      };
    });
  }

  async findFlowRecordTotalAmountPerTraderById(
    {
      endDate,
      startDate,
      savingAccountId,
      categoryId,
      categoryType,
      tagId,
    }: {
      endDate?: Date;
      startDate?: Date;
      savingAccountId?: number;
      tagId?: number;
      categoryId?: number;
      categoryType?: CategoryType;
    },
    accountBookId: number,
  ): Promise<
    Array<{
      trader: {
        id: number;
        username: string;
        password: string;
        nickname: string;
        createdAt: Date;
        updatedAt: Date;
        email?: string;
        avatar?: string;
      };
      amount: number;
    }>
  > {
    const qb = this.dataSource.manager
      .createQueryBuilder(FlowRecordEntity, 'flowRecord')
      .select('SUM(flowRecord.amount)', 'totalAmount')
      .addSelect('trader.*')
      .leftJoin('flowRecord.trader', 'trader')
      .groupBy('trader.id')
      .where('flowRecord.accountBookId = :accountBookId', { accountBookId });

    if (tagId) {
      qb.andWhere('flowRecord.tagId = :tagId', {
        tagId,
      });
    }

    if (categoryId || categoryType) {
      qb.leftJoin('flowRecord.tag', 'tag');

      if (categoryId) {
        qb.andWhere('tag.categoryId = :categoryId', { categoryId });
      }

      if (categoryType) {
        qb.leftJoin('tag.category', 'category').andWhere(
          'category.type = :categoryType',
          { categoryType },
        );
      }
    }

    if (savingAccountId) {
      qb.andWhere('flowRecord.savingAccountId = :savingAccountId', {
        savingAccountId,
      });
    }

    if (startDate) {
      qb.andWhere('flowRecord.dealAt >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('flowRecord.dealAt <= :endDate', { endDate });
    }

    const ret: Array<{
      totalAmount: string | null;
      createdAt: Date;
      updatedAt: Date;
      id: number;
      nickname: string;
      username: string;
      password: string;
      email: string | null;
      avatar: string | null;
      deletedAt: Date | null;
    }> = await qb.getRawMany();

    return ret.map((it) => {
      const { totalAmount, email, avatar, ...others } = it;
      return {
        amount: +(totalAmount || 0),
        trader: {
          ...others,
          ...(avatar && { avatar }),
          ...(email && { email }),
        },
      };
    });
  }

  async findFlowRecordTotalAmountByIdAndGroupByDate(
    {
      startDate,
      endDate,
      categoryId,
      traderId,
      savingAccountId,
      categoryType,
      tagId,
    }: {
      startDate?: Date;
      endDate?: Date;
      categoryId?: number;
      traderId?: number;
      tagId?: number;
      savingAccountId?: number;
      categoryType?: CategoryType;
    },
    accountBookId: number,
    groupBy: DateGroupBy,
  ) {
    let dataFormat: string;

    switch (groupBy) {
      case DateGroupBy.YEAR: {
        dataFormat = 'YYYY';
        break;
      }
      case DateGroupBy.MONTH: {
        dataFormat = 'YYYY-MM';
        break;
      }
      case DateGroupBy.DAY: {
        dataFormat = 'YYYY-MM-DD';
        break;
      }
    }

    const qb = this.dataSource.manager
      .createQueryBuilder(FlowRecordEntity, 'flowRecord')
      .select(`to_char(flowRecord.dealAt, '${dataFormat}')`, 'deal_at')
      .addSelect('SUM(flowRecord.amount)', 'totalAmount')
      .groupBy('deal_at')
      .where('flowRecord.accountBookId = :accountBookId', { accountBookId })
      .orderBy('deal_at', 'ASC');

    if (tagId) {
      qb.andWhere('flowRecord.tagId = :tagId', {
        tagId,
      });
    }

    if (categoryId || categoryType) {
      qb.leftJoin('flowRecord.tag', 'tag');

      if (categoryId) {
        qb.andWhere('tag.categoryId = :categoryId', { categoryId });
      }

      if (categoryType) {
        qb.leftJoin('tag.category', 'category').andWhere(
          'category.type = :categoryType',
          { categoryType },
        );
      }
    }

    if (savingAccountId) {
      qb.andWhere('flowRecord.savingAccountId = :savingAccountId', {
        savingAccountId,
      });
    }

    if (startDate) {
      qb.andWhere('flowRecord.dealAt >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('flowRecord.dealAt <= :endDate', { endDate });
    }

    if (traderId) {
      qb.andWhere('flowRecord.traderId = :traderId', { traderId });
    }

    const ret: Array<{ deal_at; totalAmount: string | null }> =
      await qb.getRawMany();

    return ret.map((it) => ({
      dealAt: it.deal_at,
      amount: +(it.totalAmount || 0),
    }));
  }

  /**
   * 获取账本下指定时间段特定类型流水的总额
   * @param arg0
   * @param accountBookId
   */
  async findFlowRecordTotalAmountById(
    {
      startDate,
      endDate,
      categoryId,
      traderId,
      savingAccountId,
      categoryType,
      tagId,
    }: {
      startDate?: Date;
      endDate?: Date;
      categoryId?: number;
      traderId?: number;
      savingAccountId?: number;
      tagId?: number;
      categoryType?: CategoryType;
    },
    accountBookId: number,
  ): Promise<number> {
    const qb = this.dataSource.manager
      .createQueryBuilder(FlowRecordEntity, 'flowRecord')
      .select('SUM(flowRecord.amount)', 'totalAmount')
      .where('flowRecord.accountBookId = :accountBookId', { accountBookId });

    if (tagId) {
      qb.andWhere('flowRecord.tagId = :tagId', {
        tagId,
      });
    }

    if (categoryId || categoryType) {
      qb.leftJoin('flowRecord.tag', 'tag');

      if (categoryId) {
        qb.andWhere('tag.categoryId = :categoryId', { categoryId });
      }

      if (categoryType) {
        qb.leftJoin('tag.category', 'category').andWhere(
          'category.type = :categoryType',
          { categoryType },
        );
      }
    }

    if (savingAccountId) {
      qb.andWhere('flowRecord.savingAccountId = :savingAccountId', {
        savingAccountId,
      });
    }

    if (traderId) {
      qb.andWhere('flowRecord.traderId = :traderId', { traderId });
    }

    if (startDate) {
      qb.andWhere('flowRecord.dealAt >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('flowRecord.dealAt <= :endDate', { endDate });
    }

    const ret = await qb.getRawOne<{ totalAmount: string | null }>();

    return +(ret?.totalAmount || 0);
  }

  async findByIdsAndUserId(
    ids: Array<number>,
    userId: number,
  ): Promise<Array<AccountBookEntity>> {
    const accountBooks = await this.dataSource.manager
      .createQueryBuilder(AccountBookEntity, 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('accountBook.id IN (:...accountBookIds)', { accountBookIds: ids })
      .andWhere('admin.id = :adminId OR member.id = :memberId', {
        adminId: userId,
        memberId: userId,
      })
      .getMany();

    return accountBooks;
  }

  async delete(id: number, user: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
      try {
        await manager.findOneOrFail(AccountBookEntity, {
          where: {
            id,
            admins: {
              id: user.id,
            },
          },
        });
      } catch (err) {
        throw new ResourceNotFoundException('账本不存在');
      }

      await manager.delete(FlowRecordEntity, {
        accountBookId: id,
      });

      await manager.delete(SavingAccountEntity, {
        accountBookId: id,
      });

      await manager.delete(TagEntity, {
        accountBookId: id,
      });

      await manager.delete(CategoryEntity, {
        accountBookId: id,
      });

      return manager.delete(AccountBookEntity, { id });
    });
  }

  async findAllByUserIdAndPagination(
    userId: number,
    pagination?: Pagination,
  ): Promise<{
    total: number;
    data: Array<AccountBookEntity>;
  }> {
    const qb = this.dataSource.manager
      .createQueryBuilder(AccountBookEntity, 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('admin.id = :adminId OR member.id = :memberId', {
        adminId: userId,
        memberId: userId,
      });

    const result = await applyPagination(
      qb,
      'accountBook',
      pagination,
    ).getManyAndCount();

    return {
      total: result[1],
      data: result[0],
    };
  }

  async findAllByIds(ids: Array<number>) {
    return await this.dataSource.manager.find(AccountBookEntity, {
      where: {
        id: In(ids),
      },
    });
  }

  async findAdminsByAccountBookId(
    accountBookId: number,
  ): Promise<Array<UserEntity>> {
    try {
      const accountBook = await this.dataSource.manager.findOneOrFail(
        AccountBookEntity,
        {
          relations: {
            admins: true,
          },
          where: {
            id: accountBookId,
          },
        },
      );
      return accountBook.admins;
    } catch (err) {
      throw new ResourceNotFoundException('账本不存在');
    }
  }

  async findMembersByAccountBookId(
    accountBookId: number,
  ): Promise<Array<UserEntity>> {
    try {
      const accountBook = await this.dataSource.manager.findOneOrFail(
        AccountBookEntity,
        {
          relations: {
            members: true,
          },
          where: {
            id: accountBookId,
          },
        },
      );
      return accountBook.members;
    } catch (err) {
      throw new ResourceNotFoundException('账本不存在');
    }
  }

  create(
    accountBookInput: {
      name: string;
      adminIds?: Array<number>;
      memberIds?: Array<number>;
      desc?: string;
    },
    author: UserEntity,
  ): Promise<AccountBookEntity> {
    return this.dataSource.transaction(async (manager) => {
      const adminIds = accountBookInput.adminIds || [];
      const memberIds = accountBookInput.memberIds || [];

      const adminIdSet = new Set(adminIds);

      adminIdSet.add(author.id);

      const memberIdSet = new Set(memberIds);

      adminIdSet.forEach((it) => {
        memberIdSet.delete(it);
      });

      const admins = await manager.find(UserEntity, {
        where: {
          id: In(Array.from(adminIdSet)),
        },
      });

      const members = await manager.find(UserEntity, {
        where: {
          id: In(Array.from(memberIdSet)),
        },
      });

      const accountBook = new AccountBookEntity();
      accountBook.name = accountBookInput.name;
      accountBook.desc = accountBookInput.desc;
      accountBook.createdBy = author;
      accountBook.updatedBy = author;
      accountBook.admins = admins;
      accountBook.members = members;

      return manager.save(accountBook);
    });
  }

  async update(
    id: number,
    accountBookInput: {
      adminIds?: Array<number>;
      memberIds?: Array<number>;
      name?: string;
      desc?: string;
    },
    user: UserEntity,
  ): Promise<AccountBookEntity> {
    const { name, desc, adminIds, memberIds } = accountBookInput;

    return this.dataSource.transaction(async (manager) => {
      let accountBook: AccountBookEntity;
      // 只有管理员能更新
      try {
        accountBook = await manager.findOneOrFail(AccountBookEntity, {
          where: {
            id,
            admins: {
              id: user.id,
            },
          },
        });
      } catch (err) {
        throw new ResourceNotFoundException('账本不存在');
      }

      accountBook.updatedBy = user;

      if (name) {
        accountBook.name = name;
      }
      if (desc) {
        accountBook.desc = desc;
      }

      if (adminIds) {
        const adminIdSet = new Set(adminIds);

        adminIdSet.add(user.id);

        const admins = await manager.find(UserEntity, {
          where: {
            id: In(Array.from(adminIdSet)),
          },
        });
        accountBook.admins = admins;
      }

      if (memberIds) {
        const memberIdSet = new Set(memberIds);

        accountBook.admins.forEach((it) => {
          memberIdSet.delete(it.id);
        });

        const members = await manager.find(UserEntity, {
          where: {
            id: In(Array.from(memberIdSet)),
          },
        });
        accountBook.members = members;
      }

      await manager.save(AccountBookEntity, accountBook);

      return accountBook;
    });
  }
}
