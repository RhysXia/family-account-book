import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, In } from 'typeorm';
import { FlowRecordEntity } from '../entity/FlowRecordEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { TagEntity, TagType } from '../entity/TagEntity';
import { UserEntity } from '../entity/UserEntity';
import {
  CreateFlowRecordInput,
  Pagination,
  UpdateFlowRecordInput,
} from '../graphql/graphql';
import { SavingAccountHistoryManager } from '../manager/SavingAccountHistoryManager';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class FlowRecordService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly savingAccountMoneyRecordManager: SavingAccountHistoryManager,
  ) {}

  async delete(id: number, currentUser: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
      const record = await manager.findOne(FlowRecordEntity, {
        where: {
          id,
          accountBook: [
            {
              admins: { id: currentUser.id },
            },
            {
              members: { id: currentUser.id },
            },
          ],
        },
      });

      if (!record) {
        throw new Error('流水不存在或者没有删除权限');
      }

      await this.savingAccountMoneyRecordManager.reset(manager, {
        amount: record.amount,
        dealAt: record.dealAt,
        savingAccountId: record.savingAccountId,
      });

      await manager.remove(record);
    });
  }

  async update(flowRecordInput: UpdateFlowRecordInput, user: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
      const { id, desc, dealAt, amount, savingAccountId, tagId } =
        flowRecordInput;

      const flowRecord = await manager
        .createQueryBuilder(FlowRecordEntity, 'flowRecord')
        .leftJoin('flowRecord.accountBook', 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('flowRecord.id = :id', { id })
        .andWhere(
          new Brackets((qb) => {
            qb.where('admin.id = :adminId', { adminId: user.id }).orWhere(
              'member.id = :memberId',
              { memberId: user.id },
            );
          }),
        )
        .getOne();

      if (!flowRecord) {
        throw new Error('流水不存在');
      }

      if (desc) {
        flowRecord.desc = desc;
      }

      let tag: TagEntity;

      if (tagId) {
        tag = await manager.findOne(TagEntity, {
          where: { id: tagId, accountBookId: flowRecord.accountBookId },
        });
        if (!tag) {
          throw new Error('标签不存在');
        }
        flowRecord.tag = tag;
      } else {
        tag = await manager.findOne(TagEntity, {
          where: { id: flowRecord.tagId },
        });
      }

      if (savingAccountId) {
        const savingAccount = await manager.findOne(SavingAccountEntity, {
          where: {
            id: savingAccountId,
            accountBookId: flowRecord.accountBookId,
          },
        });

        if (!savingAccount) {
          throw new Error('储蓄账户不存在');
        }
      }

      const newSavingAccountId = savingAccountId || flowRecord.savingAccountId;
      const newAmount = amount || flowRecord.amount;
      const newDealAt = dealAt || flowRecord.dealAt;

      // 支出不能为正数
      if (tag.type === TagType.EXPENDITURE) {
        if (newAmount >= 0) {
          throw new Error('支出不能为正数');
        }
      } else if (tag.type === TagType.INCOME) {
        if (newAmount <= 0) {
          throw new Error('收入不能为负数');
        }
      }

      await this.savingAccountMoneyRecordManager.update(manager, {
        oldAmount: flowRecord.amount,
        oldDealAt: flowRecord.dealAt,
        oldSavingAccountId: flowRecord.savingAccountId,
        newAmount,
        newDealAt,
        newSavingAccountId,
      });

      flowRecord.savingAccountId = newSavingAccountId;
      flowRecord.dealAt = newDealAt;
      flowRecord.amount = newAmount;

      return manager.save(flowRecord);
    });
  }

  async create(flowRecordInput: CreateFlowRecordInput, user: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
      const { desc, amount, dealAt, savingAccountId, tagId } = flowRecordInput;

      const savingAccount = await manager
        .createQueryBuilder(SavingAccountEntity, 'savingAccount')
        .leftJoin('savingAccount.accountBook', 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('savingAccount.id = :id', { id: savingAccountId })
        .andWhere(
          new Brackets((qb) => {
            qb.where('admin.id = :adminId', { adminId: user.id }).orWhere(
              'member.id = :memberId',
              { memberId: user.id },
            );
          }),
        )
        .getOne();

      if (!savingAccount) {
        throw new Error('储蓄账户不存在');
      }

      const accountBookId = savingAccount.accountBookId;

      const tag = await manager.findOne(TagEntity, {
        where: { id: tagId, accountBookId },
      });

      if (!tag) {
        throw new Error('标签不存在');
      }

      /**
       * 支出为负数
       * 收入为正数
       * 投资可正可负
       * 借贷可正可负
       */

      // 支出不能为正数
      if (tag.type === TagType.EXPENDITURE) {
        if (amount >= 0) {
          throw new Error('支出不能为正数');
        }
      } else if (tag.type === TagType.INCOME) {
        if (amount <= 0) {
          throw new Error('收入不能为负数');
        }
      }

      await this.savingAccountMoneyRecordManager.create(manager, {
        amount,
        dealAt,
        savingAccountId,
      });

      const flowRecordEntity = new FlowRecordEntity();

      flowRecordEntity.desc = desc;
      flowRecordEntity.dealAt = dealAt;
      flowRecordEntity.amount = amount;
      flowRecordEntity.accountBookId = accountBookId;
      flowRecordEntity.savingAccount = savingAccount;
      flowRecordEntity.tag = tag;
      flowRecordEntity.creator = user;
      flowRecordEntity.updater = user;

      return manager.save(flowRecordEntity);
    });
  }

  async findAllByIds(ids: Array<number>) {
    return this.dataSource.manager.find(FlowRecordEntity, {
      where: { id: In(ids) },
    });
  }

  async findAllByAccountBookIdAndPagination(
    accountBookId: number,
    pagination?: Pagination,
  ): Promise<{ total: number; data: Array<FlowRecordEntity> }> {
    const qb = this.dataSource
      .createQueryBuilder(FlowRecordEntity, 'flowRecord')
      .where('flowRecord.accountBookId = :accountBookId', { accountBookId });

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

  async findAllByTagIdAndPagination(
    tagId: number,
    pagination: Pagination,
  ): Promise<{ total: number; data: Array<FlowRecordEntity> }> {
    const qb = this.dataSource
      .createQueryBuilder(FlowRecordEntity, 'flowRecord')
      .where('flowRecord.tagId = :tagId', { tagId });

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

  async findAllBySavingAccountIdAndPagination(
    savingAccountId: number,
    pagination: Pagination,
  ): Promise<{ total: number; data: Array<FlowRecordEntity> }> {
    const qb = this.dataSource
      .createQueryBuilder(FlowRecordEntity, 'flowRecord')
      .where('flowRecord.savingAccountId = :savingAccountId', {
        savingAccountId,
      });

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
