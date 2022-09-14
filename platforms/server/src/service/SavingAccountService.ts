import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { SavingAccountHistoryEntity } from '../entity/SavingAccountHistoryEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { UserEntity } from '../entity/UserEntity';
import { Pagination } from '../graphql/graphql';
import { SavingAccountAmountView } from '../entity/SavingAccountAmountView';
import { applyPagination } from '../utils/applyPagination';
import {
  ParameterException,
  ResourceNotFoundException,
} from '../exception/ServiceException';

@Injectable()
export class SavingAccountService {
  constructor(private readonly dataSource: DataSource) {}

  async delete(id: number, currentUser: UserEntity) {
    return await this.dataSource.transaction(async (manager) => {
      const savingAccount = await manager
        .createQueryBuilder(SavingAccountEntity, 'savingAccount')
        .leftJoin('savingAccount.accountBook', 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('savingAccount.id = :id', { id })
        .andWhere('admin.id = :adminId OR member.id = :memberId', {
          adminId: currentUser.id,
          memberId: currentUser.id,
        })
        .getOne();

      if (!savingAccount) {
        throw new ResourceNotFoundException('储蓄账户不存在');
      }

      // 软删除
      await manager.softRemove(savingAccount);
    });
  }

  findAllByIds(ids: Array<number>) {
    return this.dataSource.manager.find(SavingAccountEntity, {
      where: {
        id: In(ids),
      },
    });
  }

  async findByIdsAndUserId(ids: Array<number>, userId: number) {
    const savingAccounts = await this.dataSource.manager
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

    return savingAccounts;
  }

  async findAllByAccountBookIdAndPagination(
    accountBookId: number,
    pagination?: Pagination,
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

  async create(
    savingsInput: {
      accountBookId: number;
      name: string;
      amount: number;
      desc?: string;
    },
    user: UserEntity,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const { accountBookId, name, desc, amount } = savingsInput;

      if (amount < 0) {
        throw new ParameterException('账户余额不能为负数');
      }

      const accountBook = await manager
        .createQueryBuilder(AccountBookEntity, 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('accountBook.id = :id', {
          id: accountBookId,
        })
        .andWhere('admin.id = :adminId OR member.id = :memberId', {
          adminId: user.id,
          memberId: user.id,
        })
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

  update(
    id: number,
    savingsInput: {
      accountBookId?: number;
      name?: string;
      desc?: string;
      amount?: number;
    },
    user: UserEntity,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const { name, desc, amount } = savingsInput;

      let savingAccount: SavingAccountEntity;

      try {
        savingAccount = await manager.findOneOrFail(SavingAccountEntity, {
          where: { id },
        });
      } catch (err) {
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
        if (amount < 0) {
          throw new ParameterException('账户余额不能为负数');
        }

        const moneyEntity = await manager.findOne(SavingAccountAmountView, {
          where: {
            savingAccountId: savingAccount.id,
          },
        });

        const defaultAmount = moneyEntity
          ? moneyEntity.amount
          : savingAccount.initialAmount;

        const diff = amount - defaultAmount;

        if (diff < 0) {
          if (savingAccount.initialAmount + diff < 0) {
            throw new ParameterException('更新余额会导致存在历史余额小于0');
          }

          // 获得当前最小的历史记录
          const minAmountMoneyEntity = await manager.findOne(
            SavingAccountHistoryEntity,
            {
              where: {
                savingAccountId: savingAccount.id,
              },
              order: {
                amount: 'ASC',
              },
            },
          );

          if (minAmountMoneyEntity) {
            if (minAmountMoneyEntity.amount + diff < 0) {
              throw new ParameterException('更新余额会导致存在历史余额小于0');
            }
          }
        }

        savingAccount.initialAmount += diff;

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
      }

      return manager.save(savingAccount);
    });
  }
}
