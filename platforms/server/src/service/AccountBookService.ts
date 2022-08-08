import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { UserEntity } from '../entity/UserEntity';
import {
  AccountBook,
  CreateAccountBookInput,
  UpdateAccountBookInput,
} from '../graphql/graphql';
import { omit } from '../utils/omit';

@Injectable()
export class AccountBookService {
  constructor(private readonly dataSource: DataSource) {}

  async findAdminsByAccountBookId(
    accountBookId: number,
  ): Promise<Array<Omit<UserEntity, 'password'>>> {
    const accountBook = await this.dataSource.manager.findOne(
      AccountBookEntity,
      {
        relations: {
          admins: true,
        },
        where: {
          id: accountBookId,
        },
      },
    );

    if (!accountBook) {
      throw new Error('账本不存在');
    }

    const admins = accountBook.admins.map((it) => omit(it, 'password'));

    return admins;
  }

  async findMembersByAccountBookId(
    accountBookId: number,
  ): Promise<Array<Omit<UserEntity, 'password'>>> {
    const accountBook = await this.dataSource.manager.findOne(
      AccountBookEntity,
      {
        relations: {
          members: true,
        },
        where: {
          id: accountBookId,
        },
      },
    );

    if (!accountBook) {
      throw new Error('账本不存在');
    }

    const members = accountBook.members.map((it) => omit(it, 'password'));

    return members;
  }

  create(
    accountBookInput: CreateAccountBookInput,
    author: UserEntity,
  ): Promise<AccountBook> {
    return this.dataSource.transaction(async (manager) => {
      const adminIds = accountBookInput.adminIds || [];
      const memberIds = accountBookInput.memberIds || [];

      const adminIdSet = new Set(adminIds);

      adminIdSet.add(author.id);

      const memberIdSet = new Set(memberIds);

      adminIdSet.forEach((it) => {
        memberIdSet.delete(it);
      });

      const admins = await manager.find(UserEntity, {
        where: {
          id: In(Array.from(adminIdSet)),
        },
      });

      const members = await manager.find(UserEntity, {
        where: {
          id: In(Array.from(memberIdSet)),
        },
      });

      const accountBook = new AccountBookEntity();
      accountBook.name = accountBookInput.name;
      accountBook.desc = accountBookInput.desc;
      accountBook.creator = author;
      accountBook.updater = author;
      accountBook.admins = admins;
      accountBook.members = members;

      return manager.save(accountBook);
    });
  }

  async update(
    accountBookInput: UpdateAccountBookInput,
    user: UserEntity,
  ): Promise<AccountBook> {
    const { id, name, desc, adminIds, memberIds } = accountBookInput;

    return this.dataSource.transaction(async (manager) => {
      // 只有管理员能更新
      const accountBook = await manager.findOne(AccountBookEntity, {
        where: {
          id,
          admins: {
            id: user.id,
          },
        },
      });

      if (!accountBook) {
        throw new Error('账本不存在');
      }
      if (name) {
        accountBook.name = name;
      }
      if (desc) {
        accountBook.desc = desc;
      }

      if (adminIds) {
        const adminIdSet = new Set(adminIds);

        adminIdSet.add(user.id);

        const admins = await manager.find(UserEntity, {
          where: {
            id: In(Array.from(adminIdSet)),
          },
        });
        accountBook.admins = admins;
      }

      if (memberIds) {
        const memberIdSet = new Set(memberIds);

        accountBook.admins.forEach((it) => {
          memberIdSet.delete(it.id);
        });

        const members = await manager.find(UserEntity, {
          where: {
            id: In(Array.from(memberIdSet)),
          },
        });
        accountBook.members = members;
      }

      await manager.save(AccountBookEntity, accountBook);

      return accountBook;
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

  async findByIdAndUser(id: number, user: UserEntity) {
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
