import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, In } from 'typeorm';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { SavingAccountTransferRecordEntity } from '../entity/SavingAccountTransferRecordEntity';
import { UserEntity } from '../entity/UserEntity';
import {
  ParameterException,
  ResourceNotFoundException,
} from '../exception/ServiceException';
import { Pagination } from '../graphql/graphql';

import { SavingAccountHistoryManager } from '../manager/SavingAccountHistoryManager';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class SavingAccountTransferRecordService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly savingAccountHistoryManager: SavingAccountHistoryManager,
  ) {}

  async findAllByConditionAndPagination(
    {
      traderId,
      fromSavingAccountId,
      toSavingAccountId,
      startDealAt,
      endDealAt,
      accountBookId,
    }: {
      traderId?: number;
      fromSavingAccountId?: number;
      toSavingAccountId?: number;
      startDealAt?: Date;
      endDealAt?: Date;
      accountBookId: number;
    },
    pagination?: Pagination,
  ): Promise<{ total: any; data: Array<SavingAccountTransferRecordEntity> }> {
    const qb = this.dataSource
      .createQueryBuilder(SavingAccountTransferRecordEntity, 'transferRecord')
      .where('transferRecord.accountBookId = :accountBookId', {
        accountBookId,
      });

    if (traderId) {
      qb.andWhere('transferRecord.traderId = :traderId', { traderId });
    }

    if (toSavingAccountId) {
      qb.andWhere('transferRecord.toId = :toSavingAccountId', {
        toSavingAccountId,
      });
    }

    if (fromSavingAccountId) {
      qb.andWhere('transferRecord.fromId = :fromSavingAccountId', {
        fromSavingAccountId,
      });
    }

    if (startDealAt) {
      qb.andWhere('transferRecord.dealAt >= :startDealAt', {
        startDealAt,
      });
    }

    if (endDealAt) {
      qb.andWhere('transferRecord.dealAt <= :endDealAt', {
        endDealAt,
      });
    }

    const result = await applyPagination(
      qb,
      'transferRecord',
      pagination,
    ).getManyAndCount();

    return {
      total: result[1],
      data: result[0],
    };
  }

  async findByIdsAndUserId(ids: Array<number>, userId: number) {
    const transferRecords = await this.dataSource.manager
      .createQueryBuilder(SavingAccountTransferRecordEntity, 'transferRecord')
      .leftJoin('transferRecord.accountBook', 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('transferRecord.id IN (:...ids)', { ids })
      .andWhere('admin.id = :adminId OR member.id = :memberId', {
        adminId: userId,
        memberId: userId,
      })
      .getMany();

    return transferRecords;
  }

  async delete(id: number, currentUser: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
      const record = await manager
        .createQueryBuilder(SavingAccountTransferRecordEntity, 'transferRecord')
        .leftJoin('transferRecord.accountBook', 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('transferRecord.id = :id', { id })
        .andWhere('admin.id = :adminId OR member.id = :memberId', {
          adminId: currentUser.id,
          memberId: currentUser.id,
        })
        .getOne();

      if (!record) {
        throw new ResourceNotFoundException('记录不存在');
      }

      await this.savingAccountHistoryManager.reset(manager, {
        amount: -record.amount,
        dealAt: record.dealAt,
        savingAccountId: record.fromId,
      });

      await this.savingAccountHistoryManager.reset(manager, {
        amount: record.amount,
        dealAt: record.dealAt,
        savingAccountId: record.toId,
      });

      return manager.remove(record);
    });
  }

  findAllByIds(ids: Array<number>) {
    return this.dataSource.manager.find(SavingAccountTransferRecordEntity, {
      where: {
        id: In(ids),
      },
    });
  }

  async create(
    record: {
      desc?: string;
      amount: number;
      dealAt: Date;
      fromSavingAccountId: number;
      toSavingAccountId: number;
      traderId: number;
    },
    currentUser: UserEntity,
  ) {
    const {
      desc,
      amount,
      fromSavingAccountId,
      toSavingAccountId,
      dealAt,
      traderId,
    } = record;

    if (amount <= 0) {
      throw new ParameterException('金额必须大于0');
    }

    if (fromSavingAccountId === toSavingAccountId) {
      throw new ParameterException('转入和转出账户不能相同');
    }

    return this.dataSource.transaction(async (manager) => {
      const fromSavingAccount = await manager
        .createQueryBuilder(SavingAccountEntity, 'savingAccount')
        .leftJoin('savingAccount.accountBook', 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('savingAccount.id = :savingAccountId', {
          savingAccountId: fromSavingAccountId,
        })
        .andWhere(
          new Brackets((qb) => {
            qb.where('admin.id = :adminId', {
              adminId: currentUser.id,
            }).orWhere('member.id = :memberId', { memberId: currentUser.id });
          }),
        )
        .getOne();

      if (!fromSavingAccount) {
        throw new ResourceNotFoundException('转出账户不存在');
      }

      const toSavingAccount = await manager
        .createQueryBuilder(SavingAccountEntity, 'savingAccount')
        .where('savingAccount.id = :id', { id: toSavingAccountId })
        .getOne();

      console.log(
        fromSavingAccountId,
        toSavingAccountId,
        fromSavingAccount,
        toSavingAccount,
      );

      if (!toSavingAccount) {
        throw new ResourceNotFoundException('转入账户不存在');
      }

      if (fromSavingAccount.accountBookId !== toSavingAccount.accountBookId) {
        throw new ParameterException('转出账户和转入账户不在同一个账本');
      }

      await this.savingAccountHistoryManager.create(manager, {
        amount: -amount,
        dealAt,
        savingAccountId: fromSavingAccountId,
      });

      await this.savingAccountHistoryManager.create(manager, {
        amount,
        dealAt,
        savingAccountId: toSavingAccountId,
      });

      const newRecord = new SavingAccountTransferRecordEntity();

      try {
        const trader = await manager.findOneOrFail(UserEntity, {
          where: {
            id: traderId,
          },
        });
        newRecord.trader = trader;
      } catch (err) {
        throw new ParameterException('交易人员不存在');
      }

      newRecord.desc = desc;
      newRecord.amount = amount;
      newRecord.creator = currentUser;
      newRecord.updater = currentUser;
      newRecord.from = fromSavingAccount;
      newRecord.to = toSavingAccount;
      newRecord.accountBookId = fromSavingAccount.accountBookId;
      newRecord.dealAt = dealAt;

      return manager.save(newRecord);
    });
  }

  async update(
    id: number,
    record: {
      desc?: string;
      amount?: number;
      dealAt?: Date;
      fromSavingAccountId?: number;
      toSavingAccountId?: number;
      traderId?: number;
    },
    currentUser: UserEntity,
  ) {
    const {
      desc,
      amount,
      fromSavingAccountId,
      toSavingAccountId,
      dealAt,
      traderId,
    } = record;

    if (amount === undefined || amount <= 0) {
      throw new ParameterException('金额必须大于0');
    }

    return this.dataSource.transaction(async (manager) => {
      let oldRecord: SavingAccountTransferRecordEntity;
      try {
        oldRecord = await manager.findOneOrFail(
          SavingAccountTransferRecordEntity,
          {
            where: {
              id,
            },
            relations: {
              from: true,
              to: true,
            },
          },
        );
      } catch (err) {
        throw new ResourceNotFoundException('转账记录不存在');
      }

      if (traderId) {
        try {
          const trader = await manager.findOneOrFail(UserEntity, {
            where: {
              id: traderId,
            },
          });
          oldRecord.trader = trader;
        } catch (err) {
          throw new ParameterException('交易人员不存在');
        }
      }

      await this.savingAccountHistoryManager.reset(manager, {
        amount: -oldRecord.amount,
        dealAt: oldRecord.dealAt,
        savingAccountId: oldRecord.fromId,
      });

      await this.savingAccountHistoryManager.reset(manager, {
        amount: oldRecord.amount,
        dealAt: oldRecord.dealAt,
        savingAccountId: oldRecord.toId,
      });

      oldRecord.updater = currentUser;

      if (desc) {
        oldRecord.desc = desc;
      }

      if (amount) {
        oldRecord.amount = amount;
      }

      if (dealAt) {
        oldRecord.dealAt = dealAt;
      }

      if (fromSavingAccountId) {
        const fromSavingAccount = await manager
          .createQueryBuilder(SavingAccountEntity, 'savingAccount')
          .leftJoin('savingAccount.accountBook', 'accountBook')
          .leftJoin('accountBook.admins', 'admin')
          .leftJoin('accountBook.members', 'member')
          .where('savingAccount.id = :savingAccountId', {
            savingAccountId: fromSavingAccountId,
          })
          .andWhere(
            new Brackets((qb) => {
              qb.where('admin.id = :adminId', { adminId: currentUser.id });
              qb.orWhere('member.id = :memberId', { memberId: currentUser.id });
            }),
          )
          .getOne();

        if (!fromSavingAccount) {
          throw new ResourceNotFoundException('转出账户不存在');
        }

        if (fromSavingAccount.accountBookId !== oldRecord.from.accountBookId) {
          throw new ParameterException('不能跨账本修改转账记录');
        }

        oldRecord.from = fromSavingAccount;
      }

      if (toSavingAccountId) {
        const toSavingAccount = await manager
          .createQueryBuilder(SavingAccountEntity, 'savingAccount')
          .where('savingAccount.id = :id', { id: toSavingAccountId })
          .getOne();

        if (!toSavingAccount) {
          throw new ResourceNotFoundException('转入账户不存在');
        }

        if (toSavingAccount.accountBookId !== oldRecord.to.accountBookId) {
          throw new ParameterException('不能跨账本修改转账记录');
        }

        oldRecord.to = toSavingAccount;
      }

      if (oldRecord.to.accountBookId !== oldRecord.from.accountBookId) {
        throw new ParameterException('转出账户和转入账户不在同一个账本');
      }

      await this.savingAccountHistoryManager.create(manager, {
        amount: -oldRecord.amount,
        dealAt: oldRecord.dealAt,
        savingAccountId: oldRecord.from.id,
      });

      await this.savingAccountHistoryManager.create(manager, {
        amount: oldRecord.amount,
        dealAt: oldRecord.dealAt,
        savingAccountId: oldRecord.to.id,
      });

      return manager.save(oldRecord);
    });
  }
}
