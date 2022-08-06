import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { UserEntity } from '../entity/UserEntity';
import { AccountBook, AccountBookInput } from '../graphql/graphql';

@Injectable()
export class AccountBookService {
  constructor(private readonly dataSource: DataSource) {}

  create(
    accountBookInput: AccountBookInput,
    author: UserEntity,
  ): Promise<AccountBook> {
    return this.dataSource.transaction(async (manager) => {
      const adminIds = accountBookInput.adminIds;
      const memberIds = accountBookInput.memberIds;

      const adminIdSet = new Set(adminIds);

      if (adminIdSet.size !== adminIds.length) {
        throw new Error('管理员id重复');
      }

      adminIdSet.add(author.id);

      if (adminIdSet.size !== adminIds.length + 1) {
        throw new Error('无需将自己加入管理员，默认管理员会包含自己');
      }

      if (memberIds.some((it) => adminIdSet.has(it))) {
        throw new Error('请不要将用户同时加入管理员和成员');
      }

      const memberIdSet = new Set(memberIds);
      if (memberIdSet.size !== memberIds.length) {
        throw new Error('成员id重复');
      }

      const admins = await manager.find(UserEntity, {
        where: {
          id: In(Array.from(adminIdSet)),
        },
      });

      if (admins.length !== adminIds.length + 1) {
        throw new Error('请传入正确的管理员id');
      }

      const members = await manager.find(UserEntity, {
        where: {
          id: In(Array.from(memberIdSet)),
        },
      });

      if (members.length !== memberIdSet.size) {
        throw new Error('请传入正确的成员id');
      }

      const now = new Date();

      const accountBook = new AccountBookEntity();
      accountBook.name = accountBookInput.name;
      accountBook.desc = accountBookInput.desc;
      accountBook.creator = author;
      accountBook.admins = admins;
      accountBook.members = members;
      accountBook.createdAt = now;
      accountBook.updatedAt = now;
      return manager.save(accountBook);
    });
  }

  async findAllByUser(user: UserEntity) {
    return await this.dataSource.manager
      .createQueryBuilder(AccountBookEntity, 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('admin.id = :id')
      .orWhere('member.id = :id')
      .setParameter('id', user.id)
      .getMany();
  }

  async findByUserAndId(user: UserEntity, id: number) {
    return await this.dataSource.manager
      .createQueryBuilder(AccountBookEntity, 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('accountBook.id = :accountBookId', { id })
      .andWhere(
        new Brackets((qb) => {
          qb.where('admin.id = :id').orWhere('member.id = :id');
        }),
      )
      .setParameters({
        accountBookId: id,
        id: user.id,
      })
      .getOne();
  }
}
