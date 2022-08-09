import { Injectable } from '@nestjs/common';
import { Brackets, DataSource } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { SavingAccountMoneyRecordEntity } from '../entity/SavingAccountMoneyRecordEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { UserEntity } from '../entity/UserEntity';
import {
  CreateSavingAccountInput,
  UpdateSavingAccountInput,
} from '../graphql/graphql';
import { SavingAccountMoneyViewEntity } from '../entity/SavingAccountMoneyViewEntity';

@Injectable()
export class SavingAccountService {
  constructor(private readonly dataSource: DataSource) {}

  async findAllByAccountBookIdAndUser(accountBookId: number, user: UserEntity) {
    const accountBook = await this.dataSource.manager
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
    const savings = await this.dataSource.manager
      .createQueryBuilder(SavingAccountEntity, 'savings')
      .leftJoin('savings.accountBook', 'accountBook')
      .where('accountBook.id = :id', { id: accountBook.id })
      .getMany();

    return savings;
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

        console.log(
          moneyEntity,
          typeof moneyEntity.amount,
          typeof moneyEntity.createdAt,
          typeof moneyEntity.id,
          typeof moneyEntity.savingAccountId,
        );

        const diff = amount - moneyEntity.amount;

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
