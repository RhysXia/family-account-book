import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { CategoryEntity, CategoryType } from '../entity/CategoryEntity';
import { FlowRecordEntity } from '../entity/FlowRecordEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { TagEntity } from '../entity/TagEntity';
import { UserEntity } from '../entity/UserEntity';
import {
  ParameterException,
  ResourceNotFoundException,
} from '../exception/ServiceException';
import { DateGroupBy, Pagination } from '../graphql/graphql';
import { PrefixWrapper } from '../types';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class FlowRecordService {
  constructor(private readonly dataSource: DataSource) {}

  async findFlowRecordTotalAmountPerTagAndTraderByCategoryId(
    {
      endDealAt,
      startDealAt,
      savingAccountId,
      tagId,
      traderId,
    }: {
      endDealAt?: Date;
      startDealAt?: Date;
      tagId?: number;
      savingAccountId?: number;
      traderId?: number;
    },
    categoryId: number,
  ): Promise<
    Array<{
      trader: UserEntity;
      data: Array<{
        tag: TagEntity;
        amount: number;
      }>;
    }>
  > {
    const qb = this.dataSource.manager
      .createQueryBuilder(FlowRecordEntity, 'flowRecord')
      .select('SUM(flowRecord.amount)', 'totalAmount')
      .leftJoinAndSelect('flowRecord.tag', 'tag')
      .leftJoinAndSelect('flowRecord.trader', 'trader')
      .groupBy('tag.id')
      .addGroupBy('trader.id')
      .where('tag.categoryId = :categoryId', { categoryId });

    if (traderId) {
      qb.andWhere('flowRecord.traderId = :traderId', {
        traderId,
      });
    }

    if (tagId) {
      qb.andWhere('flowRecord.tagId = :tagId', {
        tagId,
      });
    }

    if (savingAccountId) {
      qb.andWhere('flowRecord.savingAccountId = :savingAccountId', {
        savingAccountId,
      });
    }

    if (startDealAt) {
      qb.andWhere('flowRecord.dealAt >= :startDealAt', { startDealAt });
    }

    if (endDealAt) {
      qb.andWhere('flowRecord.dealAt < :endDealAt', { endDealAt });
    }

    const ret = await qb.getRawMany<
      PrefixWrapper<TagEntity, 'tag'> &
        PrefixWrapper<UserEntity, 'trader'> & {
          totalAmount: number;
        }
    >();

    const traders: Array<UserEntity> = [];

    const map = new Map<
      number,
      Array<{
        amount: number;
        tag: TagEntity;
      }>
    >();

    ret.forEach((it) => {
      const trader = new UserEntity();
      const tag = new TagEntity();
      Object.keys(it).forEach((key) => {
        const [prefix, ...others] = key.split('_');
        const originalKey = others.join('_');
        switch (prefix) {
          case 'tag': {
            tag[originalKey] = it[key];
            break;
          }
          case 'trader': {
            trader[originalKey] = it[key];
            break;
          }
        }
      });

      if (traders.every((t) => t.id !== trader.id)) {
        traders.push(trader);
      }

      const value = map.get(trader.id) || [];

      value.push({
        amount: +(it.totalAmount || 0),
        tag,
      });

      map.set(trader.id, value);
    });

    return traders.map((it) => ({
      trader: it,
      data: map.get(it.id) || [],
    }));
  }

  async findFlowRecordTotalAmountPerTagByCategoryId(
    {
      endDealAt,
      startDealAt,
      savingAccountId,
      traderId,
      tagId,
    }: {
      endDealAt?: Date;
      startDealAt?: Date;
      savingAccountId?: number;
      traderId?: number;
      tagId?: number;
    },
    categoryId: number,
  ): Promise<
    Array<{
      tag: TagEntity;
      amount: number;
    }>
  > {
    const qb = this.dataSource.manager
      .createQueryBuilder(FlowRecordEntity, 'flowRecord')
      .select('SUM(flowRecord.amount)', 'totalAmount')
      .addSelect('tag.*')
      .leftJoin('flowRecord.tag', 'tag')
      .groupBy('tag.id')
      .where('tag.categoryId = :categoryId', { categoryId });

    if (traderId) {
      qb.andWhere('flowRecord.traderId = :traderId', {
        traderId,
      });
    }

    if (tagId) {
      qb.andWhere('flowRecord.tagId = :tagId', {
        tagId,
      });
    }

    if (savingAccountId) {
      qb.andWhere('flowRecord.savingAccountId = :savingAccountId', {
        savingAccountId,
      });
    }

    if (startDealAt) {
      qb.andWhere('flowRecord.dealAt >= :startDealAt', { startDealAt });
    }

    if (endDealAt) {
      qb.andWhere('flowRecord.dealAt < :endDealAt', { endDealAt });
    }

    const ret: Array<
      TagEntity & {
        totalAmount: string | null;
      }
    > = await qb.getRawMany();

    return ret.map((it) => {
      const { totalAmount, ...tag } = it;
      return {
        amount: +(totalAmount || 0),
        tag,
      };
    });
  }

  async findFlowRecordTotalAmountPerCategoryByAccountBookId(
    {
      startDealAt,
      endDealAt,
      savingAccountId,
      tagId,
      traderId,
      categoryType,
    }: {
      endDealAt?: Date;
      startDealAt?: Date;
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

    if (startDealAt) {
      qb.andWhere('flowRecord.dealAt >= :startDealAt', { startDealAt });
    }

    if (endDealAt) {
      qb.andWhere('flowRecord.dealAt < :endDealAt', { endDealAt });
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

  async findFlowRecordTotalAmountPerTraderByAccountBookIdAndGroupByDate(
    {
      endDealAt,
      startDealAt,
      savingAccountId,
      categoryId,
      categoryType,
      tagId,
      traderId,
    }: {
      endDealAt?: Date;
      startDealAt?: Date;
      savingAccountId?: number;
      tagId?: number;
      traderId?: number;
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

    if (traderId) {
      qb.andWhere('flowRecord.traderId = :traderId', {
        traderId,
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

    if (startDealAt) {
      qb.andWhere('flowRecord.dealAt >= :startDealAt', { startDealAt });
    }

    if (endDealAt) {
      qb.andWhere('flowRecord.dealAt < :endDealAt', { endDealAt });
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

  async findFlowRecordTotalAmountPerTraderByAccountBookId(
    {
      endDealAt,
      startDealAt,
      savingAccountId,
      categoryId,
      categoryType,
      tagId,
    }: {
      endDealAt?: Date;
      startDealAt?: Date;
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

    if (startDealAt) {
      qb.andWhere('flowRecord.dealAt >= :startDealAt', { startDealAt });
    }

    if (endDealAt) {
      qb.andWhere('flowRecord.dealAt < :endDealAt', { endDealAt });
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

  async findFlowRecordTotalAmountByAccountBookIdAndGroupByDate(
    {
      startDealAt,
      endDealAt,
      categoryId,
      traderId,
      savingAccountId,
      categoryType,
      tagId,
    }: {
      startDealAt?: Date;
      endDealAt?: Date;
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

    if (startDealAt) {
      qb.andWhere('flowRecord.dealAt >= :startDealAt', { startDealAt });
    }

    if (endDealAt) {
      qb.andWhere('flowRecord.dealAt < :endDealAt', { endDealAt });
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
  async findFlowRecordTotalAmountByAccountBookId(
    {
      startDealAt,
      endDealAt,
      categoryId,
      traderId,
      savingAccountId,
      categoryType,
      tagId,
    }: {
      startDealAt?: Date;
      endDealAt?: Date;
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

    if (startDealAt) {
      qb.andWhere('flowRecord.dealAt >= :startDealAt', { startDealAt });
    }

    if (endDealAt) {
      qb.andWhere('flowRecord.dealAt < :endDealAt', { endDealAt });
    }

    const ret = await qb.getRawOne<{ totalAmount: string | null }>();

    return +(ret?.totalAmount || 0);
  }

  async findByIdsAndUserId(ids: Array<number>, userId: number) {
    const flowRecords = await this.dataSource.manager
      .createQueryBuilder(FlowRecordEntity, 'flowRecord')
      .leftJoin('flowRecord.accountBook', 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('flowRecord.id IN (:...ids)', { ids })
      .andWhere('admin.id = :adminId OR member.id = :memberId', {
        adminId: userId,
        memberId: userId,
      })
      .getMany();

    return flowRecords;
  }

  async delete(id: number, currentUser: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
      const record = await manager
        .createQueryBuilder(FlowRecordEntity, 'flowRecord')
        .leftJoin('flowRecord.accountBook', 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('flowRecord.id = :id', { id })
        .andWhere('admin.id = :adminId OR member.id = :memberId', {
          adminId: currentUser.id,
          memberId: currentUser.id,
        })
        .getOne();

      if (!record) {
        throw new ResourceNotFoundException('流水不存在');
      }

      const savingAccount = await manager.findOneOrFail(SavingAccountEntity, {
        where: {
          id: record.savingAccountId,
        },
      });

      savingAccount.amount -= record.amount;

      if (savingAccount.amount < 0) {
        throw new ParameterException('删除会导致关联储蓄账户余额小于0');
      }

      await manager.save(savingAccount);

      await manager.delete(FlowRecordEntity, { id });
    });
  }

  async update(
    id: number,
    flowRecordInput: {
      desc?: string;
      dealAt?: Date;
      amount?: number;
      savingAccountId?: number;
      tagId?: number;
      traderId?: number;
    },
    user: UserEntity,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const { desc, dealAt, amount, savingAccountId, tagId, traderId } =
        flowRecordInput;

      const flowRecord = await manager
        .createQueryBuilder(FlowRecordEntity, 'flowRecord')
        .leftJoinAndSelect('flowRecord.tag', 'tag')
        .leftJoin('flowRecord.accountBook', 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('flowRecord.id = :id', { id })
        .andWhere('admin.id = :adminId OR member.id = :memberId', {
          adminId: user.id,
          memberId: user.id,
        })
        .getOne();

      if (!flowRecord) {
        throw new ResourceNotFoundException('流水不存在');
      }

      if (dealAt) {
        flowRecord.dealAt = dealAt;
      }

      if (desc) {
        flowRecord.desc = desc;
      }

      if (traderId) {
        const trader = await manager.findOne(UserEntity, {
          where: {
            id: traderId,
          },
        });
        if (!trader) {
          throw new ResourceNotFoundException('交易人员不存在');
        }

        flowRecord.trader = trader;
      }

      if (tagId) {
        const tag = await manager.findOne(TagEntity, {
          where: {
            accountBookId: flowRecord.accountBookId,
            id: tagId,
          },
        });

        if (!tag) {
          throw new ResourceNotFoundException('有不存在的标签');
        }

        flowRecord.tag = tag;
      }

      const tag = flowRecord.tag;

      const category = await manager.findOneOrFail(CategoryEntity, {
        where: {
          id: tag.categoryId,
        },
      });

      const actualAmount = amount ?? flowRecord.amount;

      if (category.type === CategoryType.EXPENDITURE) {
        if (actualAmount >= 0) {
          throw new ParameterException('当前分类不允许金额为正数');
        }
      } else if (category.type === CategoryType.INCOME) {
        if (actualAmount <= 0) {
          throw new ParameterException('当前分类不允许金额为负数');
        }
      }

      const oldSavingAccountBook = await manager.findOneOrFail(
        SavingAccountEntity,
        {
          where: {
            id: flowRecord.savingAccountId,
          },
        },
      );

      oldSavingAccountBook.amount -= flowRecord.amount;

      const actualSavingAccount = savingAccountId ?? flowRecord.savingAccountId;

      if (flowRecord.savingAccountId !== actualSavingAccount) {
        if (oldSavingAccountBook.amount < 0) {
          throw new ParameterException('解除绑定会导致原关联储蓄账户余额小于0');
        }
      }

      await manager.save(oldSavingAccountBook);

      const newSavingAccount = await manager.findOne(SavingAccountEntity, {
        where: {
          id: actualSavingAccount,
          accountBookId: flowRecord.accountBookId,
        },
      });

      if (!newSavingAccount) {
        throw new ResourceNotFoundException('储蓄账户不存在');
      }

      newSavingAccount.amount += actualAmount;

      if (newSavingAccount.amount < 0) {
        throw new ParameterException('新关联的储蓄账户余额小于0');
      }

      await manager.save(newSavingAccount);

      flowRecord.amount = actualAmount;
      flowRecord.savingAccountId = actualSavingAccount;

      return manager.save(flowRecord);
    });
  }

  async create(
    flowRecordInput: {
      desc?: string;
      dealAt: Date;
      amount: number;
      savingAccountId: number;
      traderId: number;
      tagId: number;
    },
    user: UserEntity,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const { desc, amount, dealAt, savingAccountId, tagId, traderId } =
        flowRecordInput;

      const flowRecordEntity = new FlowRecordEntity();

      flowRecordEntity.desc = desc;
      flowRecordEntity.dealAt = dealAt;
      flowRecordEntity.amount = amount;
      flowRecordEntity.createdBy = user;
      flowRecordEntity.updatedBy = user;

      const savingAccount = await manager
        .createQueryBuilder(SavingAccountEntity, 'savingAccount')
        .leftJoin('savingAccount.accountBook', 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('savingAccount.id = :id', { id: savingAccountId })
        .andWhere('admin.id = :adminId OR member.id = :memberId', {
          adminId: user.id,
          memberId: user.id,
        })
        .getOne();

      if (!savingAccount) {
        throw new ResourceNotFoundException('储蓄账户不存在');
      }

      savingAccount.amount += amount;

      if (savingAccount.amount < 0) {
        throw new ParameterException('关联的储蓄账户余额小于0');
      }

      await manager.save(savingAccount);

      flowRecordEntity.savingAccount = savingAccount;

      const accountBookId = savingAccount.accountBookId;

      flowRecordEntity.accountBookId = accountBookId;

      const tag = await manager.findOne(TagEntity, {
        relations: {
          category: true,
        },
        where: {
          id: tagId,
          accountBookId: savingAccount.accountBookId,
        },
      });

      if (!tag) {
        throw new ResourceNotFoundException('有部分标签不存在');
      }

      flowRecordEntity.tag = tag;

      const category = tag.category;

      if (!category) {
        throw new ResourceNotFoundException('分类不存在');
      }

      if (category.type === CategoryType.EXPENDITURE) {
        if (amount >= 0) {
          throw new ParameterException('当前分类不允许金额为正数');
        }
      } else if (category.type === CategoryType.INCOME) {
        if (amount <= 0) {
          throw new ParameterException('当前分类不允许金额为负数');
        }
      }

      // 这里不检查trader不属于账本的情况
      const trader = await manager.findOne(UserEntity, {
        where: {
          id: traderId,
        },
      });

      if (!trader) {
        throw new ResourceNotFoundException('交易人员不存在');
      }

      flowRecordEntity.trader = trader;

      return manager.save(flowRecordEntity);
    });
  }

  async findAllByIds(ids: Array<number>) {
    return this.dataSource.manager.find(FlowRecordEntity, {
      where: { id: In(ids) },
    });
  }

  async findAllByConditionAndPagination(
    {
      accountBookId,
      traderId,
      savingAccountId,
      tagId,
      categoryId,
      startDealAt,
      endDealAt,
    }: {
      accountBookId?: number;
      traderId?: number;
      savingAccountId?: number;
      categoryId?: number;
      tagId?: number;
      startDealAt?: Date;
      endDealAt?: Date;
    },
    pagination?: Pagination,
  ): Promise<{ total: number; data: Array<FlowRecordEntity> }> {
    const qb = this.dataSource.createQueryBuilder(
      FlowRecordEntity,
      'flowRecord',
    );

    if (accountBookId) {
      qb.andWhere('flowRecord.accountBookId = :accountBookId', {
        accountBookId,
      });
    }

    if (traderId) {
      qb.andWhere('flowRecord.traderId = :traderId', { traderId });
    }

    if (savingAccountId) {
      qb.andWhere('flowRecord.savingAccountId = :savingAccountId', {
        savingAccountId,
      });
    }

    if (tagId) {
      qb.andWhere('flowRecord.tagId = :tagId', {
        tagId,
      });
    }

    if (categoryId) {
      qb.leftJoin('flowRecord.tag', 'tag').andWhere(
        'tag.categoryId = :categoryId',
        {
          categoryId,
        },
      );
    }

    if (startDealAt) {
      qb.andWhere('flowRecord.dealAt >= :startDealAt', {
        startDealAt,
      });
    }

    if (endDealAt) {
      qb.andWhere('flowRecord.dealAt <= :endDealAt', {
        endDealAt,
      });
    }

    const result = await applyPagination(
      qb,
      'flowRecord',
      pagination,
    ).getManyAndCount();

    return {
      total: result[1],
      data: result[0],
    };
  }
}
