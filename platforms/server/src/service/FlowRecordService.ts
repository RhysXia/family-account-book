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
import { Pagination } from '../graphql/graphql';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class FlowRecordService {
  constructor(private readonly dataSource: DataSource) {}

  async findByIdsAndUserId(ids: Array<number>, userId: number) {
    const flowRecords = await this.dataSource.manager
      .createQueryBuilder(SavingAccountEntity, 'savingAccount')
      .leftJoin('savingAccount.accountBook', 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('savingAccount.id IN (:...ids)', { ids })
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
        .leftJoin('flowRecord.accountBook', 'accountBook')
        .leftJoin('flowRecord.tag', 'tag')
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
