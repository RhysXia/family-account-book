import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, In, MoreThanOrEqual } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
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

      /**
       * 更换支付方式时，需要修改原先的支付方式的金额，其中包括在dealAt交易日期后的每一笔金额都需要减去account
       *
       * 对于更换到的支付方式，交易日期后都需要增加相应金额
       */
      if (savingAccountId && savingAccountId !== flowRecord.savingAccountId) {
        const savingAccount = await manager.findOne(SavingAccountEntity, {
          where: {
            id: savingAccountId,
            accountBookId: flowRecord.accountBookId,
          },
        });
        if (!savingAccount) {
          throw new Error('储蓄账户不存在');
        }

        let savingAccountMoneyRecordEntity = await manager
          .createQueryBuilder(
            SavingAccountMoneyRecordEntity,
            'savingAccountMoneyRecord',
          )
          .where(
            'savingAccountMoneyRecord.savingAccountId = :savingAccountId',
            {
              savingAccountId: flowRecord.savingAccountId,
              dealAt: MoreThanOrEqual(flowRecord.dealAt),
            },
          );

        if (!savingAccountMoneyRecordEntity) {
          const savingAccount = await manager.findOne(SavingAccountEntity, {
            where: {
              id: flowRecord.savingAccountId,
            },
          });

          savingAccountMoneyRecordEntity = new SavingAccountMoneyRecordEntity();
          savingAccountMoneyRecordEntity.savingAccountId = savingAccountId;
          savingAccountMoneyRecordEntity.amount = savingAccount.initialAmount;
          savingAccountMoneyRecordEntity.dealAt = dealAt;
        }

        // 原来的账户余额需要恢复
        savingAccountMoneyRecordEntity.amount -= flowRecord.amount;

        await manager.save(savingAccountMoneyRecordEntity);

        let newSavingAccountMoneyRecordEntity = await manager
          .createQueryBuilder(
            SavingAccountMoneyRecordEntity,
            'savingAccountMoneyRecord',
          )
          .where(
            'savingAccountMoneyRecord.savingAccountId = :savingAccountId',
            {
              savingAccountId,
            },
          )
          .andWhere(
            new Brackets((qb) => {
              qb.where(
                "to_char(savingAccountMoneyRecord.dealAt, 'YYYY-MM-DD') = to_char(:dealAt::timestamp, 'YYYY-MM-DD')",
                {
                  dealAt: dealAt.toISOString(),
                },
              );
            }),
          )
          .getOne();

        if (!newSavingAccountMoneyRecordEntity) {
          const savingAccount = await manager.findOne(SavingAccountEntity, {
            where: {
              id: flowRecord.savingAccountId,
            },
          });

          newSavingAccountMoneyRecordEntity =
            new SavingAccountMoneyRecordEntity();
          newSavingAccountMoneyRecordEntity.savingAccountId = savingAccountId;
          newSavingAccountMoneyRecordEntity.amount =
            savingAccount.initialAmount;
          newSavingAccountMoneyRecordEntity.dealAt = dealAt;
        }

        flowRecord.savingAccount = savingAccount;
      }

      if (tagId) {
        const tag = await manager.findOne(TagEntity, {
          where: { id: tagId, accountBookId: flowRecord.accountBookId },
        });
        if (!tag) {
          throw new Error('标签不存在');
        }
        flowRecord.tag = tag;
      }

      if (dealAt) {
      }
    });
  }

  async create(flowRecordInput: CreateFlowRecordInput, user: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
      const { desc, dealAt, amount, accountBookId, savingAccountId, tagId } =
        flowRecordInput;

      const accountBook = await manager.findOne(AccountBookEntity, {
        where: { id: accountBookId },
      });

      if (!accountBook) {
        throw new Error('账本不存在');
      }

      const savingAccount = await manager.findOne(SavingAccountEntity, {
        where: { id: savingAccountId },
      });

      if (!savingAccount) {
        throw new Error('储蓄账户不存在');
      }

      if (savingAccount.accountBookId !== accountBookId) {
        throw new Error('储蓄账户不属于该账本');
      }

      const tag = await manager.findOne(TagEntity, {
        where: { id: tagId },
      });

      if (!tag) {
        throw new Error('标签不存在');
      }

      if (tag.accountBookId !== accountBookId) {
        throw new Error('标签不属于该账本');
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

      // TODO: 这里需要考虑产生多个交易记录的情况
      let savingAccountMoneyRecordEntity = await manager
        .createQueryBuilder(
          SavingAccountMoneyRecordEntity,
          'savingAccountMoneyRecord',
        )
        .where('savingAccountMoneyRecord.savingAccountId = :savingAccountId', {
          savingAccountId,
        })
        .andWhere(
          new Brackets((qb) => {
            qb.where(
              "to_char(savingAccountMoneyRecord.dealAt, 'YYYY-MM-DD') >= to_char(:dealAt::timestamp, 'YYYY-MM-DD')",
              {
                dealAt: dealAt.toISOString(),
              },
            );
          }),
        )
        .getOne();

      if (!savingAccountMoneyRecordEntity) {
        savingAccountMoneyRecordEntity = new SavingAccountMoneyRecordEntity();
        savingAccountMoneyRecordEntity.savingAccountId = savingAccountId;
        savingAccountMoneyRecordEntity.amount = savingAccount.initialAmount;
        savingAccountMoneyRecordEntity.dealAt = dealAt;
      }

      savingAccountMoneyRecordEntity.amount += amount;

      await manager.save(savingAccountMoneyRecordEntity);

      const flowRecordEntity = new FlowRecordEntity();

      flowRecordEntity.desc = desc;
      flowRecordEntity.dealAt = dealAt;
      flowRecordEntity.amount = amount;
      flowRecordEntity.accountBook = accountBook;
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
