import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { CategoryEntity } from '../entity/CategoryEntity';
import { FlowRecordEntity } from '../entity/FlowRecordEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { TagEntity } from '../entity/TagEntity';
import { UserEntity } from '../entity/UserEntity';
import { ResourceNotFoundException } from '../exception/ServiceException';
import { Pagination } from '../graphql/graphql';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class AccountBookService {
  constructor(private readonly dataSource: DataSource) {}

  async findByIdsAndUserId(
    ids: Array<number>,
    userId: number,
  ): Promise<Array<AccountBookEntity>> {
    const accountBooks = await this.dataSource.manager
      .createQueryBuilder(AccountBookEntity, 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('accountBook.id IN (:...accountBookIds)', { accountBookIds: ids })
      .andWhere('admin.id = :adminId OR member.id = :memberId', {
        adminId: userId,
        memberId: userId,
      })
      .getMany();

    return accountBooks;
  }

  async delete(id: number, user: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
      try {
        await manager.findOneOrFail(AccountBookEntity, {
          where: {
            id,
            admins: {
              id: user.id,
            },
          },
        });
      } catch (err) {
        throw new ResourceNotFoundException('账本不存在');
      }

      await manager.delete(FlowRecordEntity, {
        accountBookId: id,
      });

      await manager.delete(SavingAccountEntity, {
        accountBookId: id,
      });

      await manager.delete(TagEntity, {
        accountBookId: id,
      });

      await manager.delete(CategoryEntity, {
        accountBookId: id,
      });

      return manager.delete(AccountBookEntity, { id });
    });
  }

  async findAllByUserIdAndPagination(
    userId: number,
    pagination?: Pagination,
  ): Promise<{
    total: number;
    data: Array<AccountBookEntity>;
  }> {
    const qb = this.dataSource.manager
      .createQueryBuilder(AccountBookEntity, 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('admin.id = :adminId OR member.id = :memberId', {
        adminId: userId,
        memberId: userId,
      });

    const result = await applyPagination(
      qb,
      'accountBook',
      pagination,
    ).getManyAndCount();

    return {
      total: result[1],
      data: result[0],
    };
  }

  async findAllByIds(ids: Array<number>) {
    return await this.dataSource.manager.find(AccountBookEntity, {
      where: {
        id: In(ids),
      },
    });
  }

  async findAdminsByAccountBookId(
    accountBookId: number,
  ): Promise<Array<UserEntity>> {
    try {
      const accountBook = await this.dataSource.manager.findOneOrFail(
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
      return accountBook.admins;
    } catch (err) {
      throw new ResourceNotFoundException('账本不存在');
    }
  }

  async findMembersByAccountBookId(
    accountBookId: number,
  ): Promise<Array<UserEntity>> {
    try {
      const accountBook = await this.dataSource.manager.findOneOrFail(
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
      return accountBook.members;
    } catch (err) {
      throw new ResourceNotFoundException('账本不存在');
    }
  }

  create(
    accountBookInput: {
      name: string;
      adminIds?: Array<number>;
      memberIds?: Array<number>;
      desc?: string;
    },
    author: UserEntity,
  ): Promise<AccountBookEntity> {
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
      accountBook.createdBy = author;
      accountBook.updatedBy = author;
      accountBook.admins = admins;
      accountBook.members = members;

      return manager.save(accountBook);
    });
  }

  async update(
    id: number,
    accountBookInput: {
      adminIds?: Array<number>;
      memberIds?: Array<number>;
      name?: string;
      desc?: string;
    },
    user: UserEntity,
  ): Promise<AccountBookEntity> {
    const { name, desc, adminIds, memberIds } = accountBookInput;

    return this.dataSource.transaction(async (manager) => {
      let accountBook: AccountBookEntity;
      // 只有管理员能更新
      try {
        accountBook = await manager.findOneOrFail(AccountBookEntity, {
          where: {
            id,
            admins: {
              id: user.id,
            },
          },
        });
      } catch (err) {
        throw new ResourceNotFoundException('账本不存在');
      }

      accountBook.updatedBy = user;

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
}
