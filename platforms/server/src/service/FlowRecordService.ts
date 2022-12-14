import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { CategoryType } from '../entity/CategoryEntity';
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
import { SavingAccountHistoryManager } from '../manager/SavingAccountHistoryManager';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class FlowRecordService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly savingAccountMoneyRecordManager: SavingAccountHistoryManager,
  ) {}

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
        throw new ResourceNotFoundException('???????????????');
      }

      await this.savingAccountMoneyRecordManager.reset(manager, {
        amount: record.amount,
        dealAt: record.dealAt,
        savingAccountId: record.savingAccountId,
      });

      await manager.remove(record);
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
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('flowRecord.id = :id', { id })
        .andWhere('admin.id = :adminId OR member.id = :memberId', {
          adminId: user.id,
          memberId: user.id,
        })
        .getOne();

      if (!flowRecord) {
        throw new ResourceNotFoundException('???????????????');
      }

      if (desc) {
        flowRecord.desc = desc;
      }

      let tag: TagEntity;

      if (tagId) {
        try {
          tag = await manager.findOneOrFail(TagEntity, {
            relations: {
              category: true,
            },
            where: { id: tagId, accountBookId: flowRecord.accountBookId },
          });
          flowRecord.tag = tag;
        } catch (err) {
          console.error(err);
          throw new ResourceNotFoundException('???????????????');
        }
      } else {
        try {
          // ????????????????????????
          tag = await manager.findOneOrFail(TagEntity, {
            relations: {
              category: true,
            },
            where: { id: flowRecord.tagId },
          });
        } catch (err) {
          throw new InternalException('???????????????');
        }
      }

      if (savingAccountId) {
        try {
          await manager.findOneOrFail(SavingAccountEntity, {
            where: {
              id: savingAccountId,
              accountBookId: flowRecord.accountBookId,
            },
          });
        } catch (err) {
          throw new ResourceNotFoundException('?????????????????????');
        }
      }

      const newSavingAccountId = savingAccountId || flowRecord.savingAccountId;
      const newAmount = amount || flowRecord.amount;
      const newDealAt = dealAt || flowRecord.dealAt;

      const category = tag.category;

      if (category.type === CategoryType.NEGATIVE_AMOUNT) {
        if (newAmount >= 0) {
          throw new ParameterException('????????????????????????????????????');
        }
      } else if (category.type === CategoryType.POSITIVE_AMOUNT) {
        if (newAmount <= 0) {
          throw new ParameterException('????????????????????????????????????');
        }
      }

      if (traderId) {
        try {
          const trader = await manager.findOneOrFail(UserEntity, {
            where: {
              id: traderId,
            },
          });
          flowRecord.trader = trader;
        } catch (err) {
          console.error(err);
          throw new ResourceNotFoundException('?????????????????????');
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

  async create(
    flowRecordInput: {
      desc?: string;
      dealAt: Date;
      amount: number;
      savingAccountId: number;
      tagId: number;
      traderId: number;
    },
    user: UserEntity,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const { desc, amount, dealAt, savingAccountId, tagId, traderId } =
        flowRecordInput;

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
        throw new ResourceNotFoundException('?????????????????????');
      }

      const accountBookId = savingAccount.accountBookId;

      let tag: TagEntity;
      try {
        tag = await manager.findOneOrFail(TagEntity, {
          relations: {
            category: true,
          },
          where: { id: tagId, accountBookId },
        });
      } catch (err) {
        throw new ResourceNotFoundException('???????????????');
      }

      const category = tag.category;

      if (category.type === CategoryType.NEGATIVE_AMOUNT) {
        if (amount >= 0) {
          throw new ParameterException('????????????????????????????????????');
        }
      } else if (category.type === CategoryType.POSITIVE_AMOUNT) {
        if (amount <= 0) {
          throw new ParameterException('????????????????????????????????????');
        }
      }
      let trader: UserEntity;
      try {
        trader = await manager.findOneOrFail(UserEntity, {
          where: {
            id: traderId,
          },
        });
      } catch (err) {
        throw new ParameterException('?????????????????????');
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
      // ???????????????trader????????????????????????
      flowRecordEntity.trader = trader;
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

  async findAllByConditionAndPagination(
    {
      accountBookId,
      traderId,
      savingAccountId,
      tagId,
      startDealAt,
      endDealAt,
    }: {
      accountBookId?: number;
      traderId?: number;
      savingAccountId?: number;
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
