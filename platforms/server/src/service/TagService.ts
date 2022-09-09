import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { TagEntity, TagType } from '../entity/TagEntity';
import { UserEntity } from '../entity/UserEntity';
import { ResourceNotFoundException } from '../exception/ServiceException';
import { Pagination } from '../graphql/graphql';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class TagService {
  constructor(private readonly dataSource: DataSource) {}

  async delete(id: number, currentUser: UserEntity) {
    return await this.dataSource.transaction(async (manager) => {
      const tag = await manager
        .createQueryBuilder(TagEntity, 'tagEntity')
        .leftJoin('tagEntity.accountBook', 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('tagEntity.id = :id', { id })
        .andWhere('admin.id = :adminId OR member.id = :memberId', {
          adminId: currentUser.id,
          memberId: currentUser.id,
        })
        .getOne();

      if (!tag) {
        throw new ResourceNotFoundException('储蓄账户不存在');
      }

      // 软删除
      await manager.softRemove(tag);
    });
  }

  update(
    id: number,
    tag: {
      name?: string;
    },
    user: UserEntity,
  ) {
    return this.dataSource.manager.transaction(async (manager) => {
      const { name } = tag;

      const tagEntity = await manager.findOne(TagEntity, {
        where: { id },
      });

      if (!tagEntity) {
        throw new ResourceNotFoundException('标签不存在');
      }

      const accountBook = await manager
        .createQueryBuilder(AccountBookEntity, 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('accountBook.id = :accountBookId', {
          accountBookId: tagEntity.accountBookId,
        })
        .andWhere('admin.id = :adminId OR member.id = :memberId', {
          adminId: user.id,
          memberId: user.id,
        })
        .getOne();

      if (!accountBook) {
        throw new ResourceNotFoundException('账本不存在');
      }

      tagEntity.name = name;
      tagEntity.updater = user;

      return manager.save(tagEntity);
    });
  }

  async create(
    tagInput: {
      name: string;
      accountBookId: number;
      type: TagType;
    },
    user: UserEntity,
  ) {
    return this.dataSource.manager.transaction(async (manager) => {
      const { accountBookId, name, type } = tagInput;

      const accountBook = await manager
        .createQueryBuilder(AccountBookEntity, 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('accountBook.id = :accountBookId', { accountBookId })
        .andWhere('admin.id = :adminId OR member.id = :memberId', {
          adminId: user.id,
          memberId: user.id,
        })
        .getOne();

      if (!accountBook) {
        throw new ResourceNotFoundException('账本不存在');
      }

      const tag = new TagEntity();

      tag.accountBook = accountBook;
      tag.name = name;
      tag.type = type;

      tag.creator = user;
      tag.updater = user;

      return manager.save(tag);
    });
  }

  findByIds(ids: Array<number>): Promise<Array<TagEntity>> {
    return this.dataSource.manager.find(TagEntity, {
      where: {
        id: In(ids),
      },
    });
  }

  async findAllByAccountBookIdAndPagination(
    accountBookId: number,
    pagination?: Pagination,
  ): Promise<{ total: number; data: Array<AccountBookEntity> }> {
    const qb = this.dataSource
      .createQueryBuilder(TagEntity, 'tag')
      .where('tag.accountBookId = :accountBookId', { accountBookId });

    const result = await applyPagination(
      qb,
      'tag',
      pagination,
    ).getManyAndCount();

    return {
      total: result[1],
      data: result[0],
    };
  }

  async findByIdsAndUserId(ids: Array<number>, userId: number) {
    const tags = await this.dataSource
      .createQueryBuilder(TagEntity, 'tag')
      .leftJoin('tag.accountBook', 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('tag.id IN (:...ids)', { ids })
      .andWhere('admin.id = :adminId OR member.id = :memberId', {
        adminId: userId,
        memberId: userId,
      })
      .getMany();
    return tags;
  }
}
