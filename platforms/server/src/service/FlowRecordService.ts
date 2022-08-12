import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, In } from 'typeorm';
import dayjs from 'dayjs';
import { FlowRecordEntity } from '../entity/FlowRecordEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { SavingAccountMoneyRecordEntity } from '../entity/SavingAccountMoneyRecordEntity';
import { TagEntity, TagType } from '../entity/TagEntity';
import { UserEntity } from '../entity/UserEntity';
import {
  CreateFlowRecordInput,
  Pagination,
  UpdateFlowRecordInput,
} from '../graphql/graphql';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class FlowRecordService {
  constructor(private readonly dataSource: DataSource) {}

  // TODO 还可以优化
  async update(flowRecordInput: UpdateFlowRecordInput, user: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
      const { id, desc, amount, savingAccountId, tagId } = flowRecordInput;

      const dealAt = dayjs(
        dayjs(flowRecordInput.dealAt).format('YYYY-MM-DD'),
      ).toDate();

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

      console.log(flowRecord.dealAt);
      console.log('==================');

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

      /**
       * 更换支付方式时，需要修改原先的支付方式的金额，其中包括在dealAt交易日期后的每一笔金额都需要减去account
       *
       * 对于更换到的支付方式，交易日期后都需要增加相应金额
       */
      const newSavingAccount = await manager.findOne(SavingAccountEntity, {
        where: {
          id: newSavingAccountId,
          accountBookId: flowRecord.accountBookId,
        },
      });

      if (!newSavingAccount) {
        throw new Error('储蓄账户不存在');
      }

      // 恢复余额
      await manager
        .createQueryBuilder()
        .update(SavingAccountMoneyRecordEntity)
        .set({
          amount: () => 'amount - ' + flowRecord.amount,
        })
        .where('savingAccountId = :savingAccountId', {
          savingAccountId: flowRecord.savingAccountId,
        })
        .andWhere('dealAt > :dealAt', {
          dealAt: flowRecord.dealAt,
        })
        .execute();

      // 增加余额
      let newSavingAccountMoneyRecordEntity = await manager
        .createQueryBuilder(
          SavingAccountMoneyRecordEntity,
          'savingAccountMoneyRecord',
        )
        .where('savingAccountMoneyRecord.savingAccountId = :savingAccountId', {
          savingAccountId: newSavingAccountId,
        })
        .andWhere('savingAccountMoneyRecord.dealAt = :dealAt', {
          dealAt: flowRecord.dealAt,
        })
        .getOne();

      if (!newSavingAccountMoneyRecordEntity) {
        newSavingAccountMoneyRecordEntity =
          new SavingAccountMoneyRecordEntity();
        newSavingAccountMoneyRecordEntity.accountBookId =
          flowRecord.accountBookId;
        newSavingAccountMoneyRecordEntity.savingAccount = newSavingAccount;
        newSavingAccountMoneyRecordEntity.amount =
          newSavingAccount.initialAmount;
        newSavingAccountMoneyRecordEntity.dealAt = newDealAt;
      }

      newSavingAccountMoneyRecordEntity.amount += newAmount;
      await manager.save(newSavingAccountMoneyRecordEntity);

      // 处理其后的交易
      await manager
        .createQueryBuilder()
        .update(SavingAccountMoneyRecordEntity)
        .set({
          amount: () => 'amount + ' + newAmount,
        })
        .where('savingAccountId = :savingAccountId', {
          savingAccountId: newSavingAccountId,
        })
        .andWhere('dealAt > :dealAt', { dealAt })
        .execute();

      flowRecord.savingAccount = newSavingAccount;
      flowRecord.dealAt = newDealAt;
      flowRecord.amount = newAmount;

      return manager.save(flowRecord);
    });
  }

  async create(flowRecordInput: CreateFlowRecordInput, user: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
      const { desc, amount, savingAccountId, tagId } = flowRecordInput;

      const dealAt = dayjs(
        dayjs(flowRecordInput.dealAt).format('YYYY-MM-DD'),
      ).toDate();

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

      // 这里需要考虑产生多个交易记录的情况
      let savingAccountMoneyRecordEntity = await manager.findOne(
        SavingAccountMoneyRecordEntity,
        {
          where: {
            savingAccountId,
            dealAt,
          },
        },
      );

      if (!savingAccountMoneyRecordEntity) {
        savingAccountMoneyRecordEntity = new SavingAccountMoneyRecordEntity();
        savingAccountMoneyRecordEntity.savingAccountId = savingAccountId;
        savingAccountMoneyRecordEntity.accountBookId = accountBookId;
        savingAccountMoneyRecordEntity.amount = savingAccount.initialAmount;
        savingAccountMoneyRecordEntity.dealAt = dealAt;
      }

      savingAccountMoneyRecordEntity.amount += amount;

      await manager.save(savingAccountMoneyRecordEntity);

      // 处理其后的交易
      await manager
        .createQueryBuilder()
        .update(SavingAccountMoneyRecordEntity)
        .set({
          amount: () => 'amount + ' + amount,
        })
        .where('savingAccountId = :savingAccountId', {
          savingAccountId,
        })
        .andWhere('dealAt > :dealAt', { dealAt })
        .execute();

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
