import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { SavingAccountMoneyRecordEntity } from '../entity/SavingAccountMoneyRecordEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { UserEntity } from '../entity/UserEntity';
import {
  CreateSavingAccountInput,
  Pagination,
  UpdateSavingAccountInput,
} from '../graphql/graphql';
import { SavingAccountMoneyViewEntity } from '../entity/SavingAccountMoneyViewEntity';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class SavingAccountService {
  constructor(private readonly dataSource: DataSource) {}

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
      throw new Error('储蓄账户不存在');
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
        throw new Error('账本不存在');
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
        throw new Error('储蓄账户不存在');
      }

      savingAccount.updater = user;

      if (name) {
        savingAccount.name = name;
      }

      if (desc) {
        savingAccount.desc = desc;
      }

      if (amount) {
        const moneyEntity = await manager.findOne(
          SavingAccountMoneyViewEntity,
          {
            where: {
              savingAccountId: savingAccount.id,
            },
          },
        );

        const defaultAmount = moneyEntity
          ? moneyEntity.amount
          : savingAccount.initialAmount;

        const diff = amount - defaultAmount;

        await manager
          .createQueryBuilder()
          .update(SavingAccountMoneyRecordEntity)
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
