import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { FlowRecordEntity } from '../entity/FlowRecordEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { SavingAccountHistoryEntity } from '../entity/SavingAccountHistoryEntity';
import { SavingAccountTransferRecordEntity } from '../entity/SavingAccountTransferRecordEntity';
import { TagEntity } from '../entity/TagEntity';
import { UserEntity } from '../entity/UserEntity';
import { ResourceNotFoundException } from '../exception/ServiceException';
import { DateGroupBy, Pagination, TagType } from '../graphql/graphql';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class AccountBookService {
  constructor(private readonly dataSource: DataSource) {}

  async findFlowRecordTotalAmountByIdAndGroupByDate(
    {
      startDate,
      endDate,
      tagType,
      traderId,
      savingAccountId,
    }: {
      startDate?: Date;
      endDate?: Date;
      tagType?: TagType;
      traderId?: number;
      savingAccountId?: number;
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

    if (tagType) {
      qb.leftJoin('flowRecord.tag', 'tag').andWhere('tag.type = :tagType', {
        tagType,
      });
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
      tagType,
      traderId,
      savingAccountId,
    }: {
      startDate?: Date;
      endDate?: Date;
      tagType?: TagType;
      traderId?: number;
      savingAccountId?: number;
    },
    accountBookId: number,
  ): Promise<number> {
    const qb = this.dataSource.manager
      .createQueryBuilder(FlowRecordEntity, 'flowRecord')
      .select('SUM(flowRecord.amount)', 'totalAmount')
      .where('flowRecord.accountBookId = :accountBookId', { accountBookId });

    if (tagType) {
      qb.leftJoin('flowRecord.tag', 'tag').andWhere('tag.type = :tagType', {
        tagType,
      });
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
      let accountBook: AccountBookEntity;
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

      await manager
        .createQueryBuilder()
        .delete()
        .from(SavingAccountTransferRecordEntity)
        .where('accountBookId = :accountBookId', {
          accountBookId: id,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(FlowRecordEntity)
        .where('accountBookId = :accountBookId', {
          accountBookId: id,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(SavingAccountHistoryEntity)
        .where('accountBookId = :accountBookId', {
          accountBookId: id,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(SavingAccountEntity)
        .where('accountBookId = :accountBookId', {
          accountBookId: id,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(TagEntity)
        .where('accountBookId = :accountBookId', {
          accountBookId: id,
        })
        .execute();

      return manager.remove(accountBook);
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
      accountBook.creator = author;
      accountBook.updater = author;
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

      accountBook.updater = user;

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
