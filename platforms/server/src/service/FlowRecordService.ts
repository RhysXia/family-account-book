import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { FlowRecordEntity } from '../entity/FlowRecordEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { SavingAccountMoneyRecordEntity } from '../entity/SavingAccountMoneyRecordEntity';
import { TagEntity } from '../entity/TagEntity';
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

  async update(flowRecord: UpdateFlowRecordInput, user: UserEntity) {
    throw new Error('Method not implemented.');
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
              "to_char(savingAccountMoneyRecord.dealAt, 'YYYY-MM-DD') = to_char(:dealAt::timestamp, 'YYYY-MM-DD')",
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

      console.log(savingAccountMoneyRecordEntity.amount);

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
