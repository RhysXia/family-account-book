import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { UserEntity } from '../entity/UserEntity';
import { Pagination } from '../graphql/graphql';
import { applyPagination } from '../utils/applyPagination';
import {
  ParameterException,
  ResourceNotFoundException,
} from '../exception/ServiceException';
import { FlowRecordEntity } from '../entity/FlowRecordEntity';

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

      await manager.delete(FlowRecordEntity, {
        savingAccountId: id,
      });

      await manager.delete(SavingAccountEntity, { id });
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
      savingAccount.amount = amount;
      savingAccount.createdBy = user;
      savingAccount.updatedBy = user;
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

      const savingAccount = await manager.findOneOrFail(SavingAccountEntity, {
        where: { id },
      });

      if (!savingAccount) {
        throw new ResourceNotFoundException('储蓄账户不存在');
      }

      savingAccount.updatedBy = user;

      if (name) {
        savingAccount.name = name;
      }

      if (desc) {
        savingAccount.desc = desc;
      }

      if (amount !== undefined) {
        if (amount < 0) {
          throw new ParameterException('账户余额不能为负数');
        }

        savingAccount.amount = amount;
      }

      return manager.save(savingAccount);
    });
  }
}
