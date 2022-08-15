import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { FlowRecordEntity } from '../entity/FlowRecordEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { SavingAccountHistoryEntity } from '../entity/SavingAccountHistoryEntity';
import { SavingAccountTransferRecordEntity } from '../entity/SavingAccountTransferRecordEntity';
import { TagEntity } from '../entity/TagEntity';
import { UserEntity } from '../entity/UserEntity';
import { ResourceNotFoundException } from '../exception/ServiceException';
import {
  CreateAccountBookInput,
  Pagination,
  UpdateAccountBookInput,
} from '../graphql/graphql';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class AccountBookService {
  constructor(private readonly dataSource: DataSource) {}

  async delete(id: number, user: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
      const accountBook = await manager.findOne(AccountBookEntity, {
        where: {
          id,
          admins: {
            id: user.id,
          },
        },
      });

      if (!accountBook) {
        // 不暴露其他数据信息，一律提示资源不存在
        throw new ResourceNotFoundException('账本不存在');
      }

      await manager
        .createQueryBuilder()
        .delete()
        .from(SavingAccountTransferRecordEntity)
        .where('accountBookId = :accountBookId', {
          accountBookId: id,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(FlowRecordEntity)
        .where('accountBookId = :accountBookId', {
          accountBookId: id,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(SavingAccountHistoryEntity)
        .where('accountBookId = :accountBookId', {
          accountBookId: id,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(SavingAccountEntity)
        .where('accountBookId = :accountBookId', {
          accountBookId: id,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(TagEntity)
        .where('accountBookId = :accountBookId', {
          accountBookId: id,
        })
        .execute();

      return manager.remove(accountBook);
    });
  }

  async findAllByUserIdAndPagination(
    userId: number,
    pagination?: Pagination,
  ): Promise<{
    total: number;
    data: AccountBookEntity[];
  }> {
    const qb = this.dataSource.manager
      .createQueryBuilder(AccountBookEntity, 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('admin.id = :adminId', { adminId: userId })
      .orWhere('member.id = :memberId', { memberId: userId });

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
      throw new ResourceNotFoundException('账本不存在');
    }

    return accountBook.admins;
  }

  async findMembersByAccountBookId(
    accountBookId: number,
  ): Promise<Array<UserEntity>> {
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
      throw new ResourceNotFoundException('账本不存在');
    }

    return accountBook.members;
  }

  create(
    accountBookInput: CreateAccountBookInput,
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
  ): Promise<AccountBookEntity> {
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
        throw new ResourceNotFoundException('账本不存在');
      }

      accountBook.updater = user;

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

  async findOneByIdAndUserId(id: number, userId: number) {
    const accountBook = await this.dataSource.manager
      .createQueryBuilder(AccountBookEntity, 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('accountBook.id = :accountBookId', { accountBookId: id })
      .andWhere(
        new Brackets((qb) => {
          qb.where('admin.id = :adminId', { adminId: userId }).orWhere(
            'member.id = :memberId',
            { memberId: userId },
          );
        }),
      )
      .getOne();

    if (!accountBook) {
      throw new ResourceNotFoundException('账本不存在');
    }

    return accountBook;
  }
}
