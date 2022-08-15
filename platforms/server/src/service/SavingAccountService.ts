import { Injectable } from '@nestjs/common';
import {
  Brackets,
  DataSource,
  FindOneOptions,
  In,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { SavingAccountHistoryEntity } from '../entity/SavingAccountHistoryEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { UserEntity } from '../entity/UserEntity';
import {
  CreateSavingAccountInput,
  Pagination,
  UpdateSavingAccountInput,
} from '../graphql/graphql';
import { SavingAccountAmountView } from '../entity/SavingAccountAmountView';
import { applyPagination } from '../utils/applyPagination';
import { ResourceNotFoundException } from '../exception/ServiceException';

@Injectable()
export class SavingAccountService {
  constructor(private readonly dataSource: DataSource) {}

  async delete(id: number, currentUser: UserEntity) {
    return await this.dataSource.transaction(async (manager) => {
      const savingAccount = await manager.findOne(SavingAccountEntity, {
        where: {
          id,
          accountBook: [
            {
              admins: [{ id: currentUser.id }],
            },
            {
              members: [{ id: currentUser.id }],
            },
          ],
        },
      });

      if (!savingAccount) {
        throw new ResourceNotFoundException('储蓄账户不存在');
      }

      // 软删除
      await manager.softRemove(savingAccount);
    });
  }

  /**
   * 获取最新余额
   * @param savingAccountIds
   * @returns
   */
  async findNewestAmountsBySavingAccountIds(savingAccountIds: Array<number>) {
    return await this.dataSource.manager.find(SavingAccountAmountView, {
      where: {
        savingAccountId: In(savingAccountIds),
      },
    });
  }

  async findHistoriesBySavingAccountIdAndDealAtBetween(
    savingAccountId: number,
    startDate: Date,
    endDate: Date,
  ) {
    const where: FindOneOptions<SavingAccountHistoryEntity>['where'] = {
      savingAccountId,
    };

    if (startDate) {
      where.dealAt = MoreThanOrEqual(startDate);
    }
    if (endDate) {
      where.dealAt = LessThanOrEqual(endDate);
    }

    return this.dataSource.manager.find(SavingAccountHistoryEntity, {
      where,
      order: {
        dealAt: 'ASC',
      },
    });
  }

  findAllByIds(ids: number[]) {
    return this.dataSource.manager.find(SavingAccountEntity, {
      where: {
        id: In(ids),
      },
    });
  }

  async findOneByIdAndUserId(id: number, userId: number) {
    const savingAccount = await this.dataSource.manager
      .createQueryBuilder(SavingAccountEntity, 'savingAccount')
      .leftJoin('savingAccount.accountBook', 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('savingAccount.id = :id', { id })
      .andWhere(
        new Brackets((qb) => {
          qb.where('admin.id = :adminId', { adminId: userId }).orWhere(
            'member.id = :memberId',
            { memberId: userId },
          );
        }),
      )
      .getOne();

    if (!savingAccount) {
      throw new ResourceNotFoundException('储蓄账户不存在');
    }

    return savingAccount;
  }

  async findAllByUserIdAndPagination(
    userId: number,
    pagination: Pagination,
  ): Promise<{ total: number; data: Array<SavingAccountEntity> }> {
    const qb = this.dataSource.manager
      .createQueryBuilder(SavingAccountEntity, 'savingAccount')
      .leftJoin('savingAccount.accountBook', 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where(
        new Brackets((qb) => {
          qb.where('admin.id = :adminId', { adminId: userId }).orWhere(
            'member.id = :memberId',
            { memberId: userId },
          );
        }),
      );

    const data = await applyPagination(
      qb,
      'savingAccount',
      pagination,
    ).getManyAndCount();

    return {
      total: data[1],
      data: data[0],
    };
  }

  async findAllByAccountBookIdAndPagination(
    accountBookId: number,
    pagination: Pagination,
  ): Promise<{ total: number; data: Array<SavingAccountEntity> }> {
    const qb = this.dataSource.manager
      .createQueryBuilder(SavingAccountEntity, 'savingAccount')
      .where('savingAccount.accountBookId = :accountBookId', { accountBookId });

    const data = await applyPagination(
      qb,
      'savingAccount',
      pagination,
    ).getManyAndCount();

    return {
      total: data[1],
      data: data[0],
    };
  }

  async create(savingsInput: CreateSavingAccountInput, user: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
      const { accountBookId, name, desc, amount } = savingsInput;

      const accountBook = await manager
        .createQueryBuilder(AccountBookEntity, 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('accountBook.id = :id', {
          id: accountBookId,
        })
        .andWhere(
          new Brackets((qb) => {
            qb.where('admin.id = :adminId', { adminId: user.id }).orWhere(
              'member.id = :memberId',
              { memberId: user.id },
            );
          }),
        )
        .getOne();

      if (!accountBook) {
        throw new ResourceNotFoundException('账本不存在');
      }

      const savingAccount = new SavingAccountEntity();

      savingAccount.name = name;
      savingAccount.desc = desc;
      savingAccount.initialAmount = amount;
      savingAccount.creator = user;
      savingAccount.updater = user;

      savingAccount.accountBook = accountBook;

      return manager.save(savingAccount);
    });
  }

  update(savingsInput: UpdateSavingAccountInput, user: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
      const { id, name, desc, amount } = savingsInput;

      const savingAccount = await manager.findOne(SavingAccountEntity, {
        where: { id },
      });

      if (!savingAccount) {
        throw new ResourceNotFoundException('储蓄账户不存在');
      }

      savingAccount.updater = user;

      if (name) {
        savingAccount.name = name;
      }

      if (desc) {
        savingAccount.desc = desc;
      }

      if (amount) {
        const moneyEntity = await manager.findOne(SavingAccountAmountView, {
          where: {
            savingAccountId: savingAccount.id,
          },
        });

        const defaultAmount = moneyEntity
          ? moneyEntity.amount
          : savingAccount.initialAmount;

        const diff = amount - defaultAmount;

        await manager
          .createQueryBuilder()
          .update(SavingAccountHistoryEntity)
          .set({
            amount: () => 'amount + ' + diff,
          })
          .where('savingAccountId = :savingAccountId', {
            savingAccountId: savingAccount.id,
          })
          .execute();

        savingAccount.initialAmount += diff;
      }

      return manager.save(savingAccount);
    });
  }
}
