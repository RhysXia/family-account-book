import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { UserEntity } from '../entity/UserEntity';
import { CreateSavingsInput } from '../graphql/graphql';

@Injectable()
export class SavingsService {
  constructor(private readonly dataSource: DataSource) {}

  async findAllByAccountBookIdAndAccountBookUser(
    accountBookId: number,
    user: UserEntity,
  ) {
    const accountBook = await this.dataSource.manager
      .createQueryBuilder(AccountBookEntity, 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('accountBook.id = :id')
      .andWhere((qb) => {
        qb.where('admin.id = :userId').orWhere('member.id = :userId');
      })
      .setParameters({
        id: accountBookId,
        userId: user.id,
      })
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

  async create(savingsInput: CreateSavingsInput, user: UserEntity) {
    const { accountBookId, name, desc, amount } = savingsInput;

    const accountBook = await this.dataSource.manager
      .createQueryBuilder(AccountBookEntity, 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('accountBook.id = :id')
      .andWhere((qb) => {
        qb.where('admin.id = :userId').orWhere('member.id = :userId');
      })
      .setParameters({
        id: accountBookId,
        userId: user.id,
      })
      .getOne();

    if (!accountBook) {
      throw new Error('账本不存在');
    }

    const savings = new SavingAccountEntity();

    const now = new Date();

    savings.name = name;
    savings.desc = desc;
    savings.creator = user;

    savings.createdAt = now;
    savings.updatedAt = now;

    savings.accountBook = accountBook;

    return this.dataSource.manager.save(savings);
  }
}
