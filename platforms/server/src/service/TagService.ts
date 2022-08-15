import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { TagEntity } from '../entity/TagEntity';
import { UserEntity } from '../entity/UserEntity';
import { ResourceNotFoundException } from '../exception/ServiceException';
import { CreateTagInput, Pagination, UpdateTagInput } from '../graphql/graphql';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class TagService {
  constructor(private readonly dataSource: DataSource) {}

  update(tag: UpdateTagInput, user: UserEntity) {
    return this.dataSource.manager.transaction(async (manager) => {
      const { id, name } = tag;

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
        throw new ResourceNotFoundException('账本不存在');
      }

      tagEntity.name = name;
      tagEntity.updater = user;

      return manager.save(tagEntity);
    });
  }

  async create(tagInput: CreateTagInput, user: UserEntity) {
    return this.dataSource.manager.transaction(async (manager) => {
      const { accountBookId, name, type } = tagInput;

      const accountBook = await manager
        .createQueryBuilder(AccountBookEntity, 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('accountBook.id = :accountBookId', { accountBookId })
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

  findByIds(ids: number[]): Promise<Array<TagEntity>> {
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

  async findAllByAccountBookIdAndUserId(accountBookId: number, userId: number) {
    const accountBook = await this.dataSource
      .createQueryBuilder(AccountBookEntity, 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('accountBook.id = :accountBookId', { accountBookId })
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
      throw new ResourceNotFoundException('标签不存在');
    }

    const tags = await this.dataSource.manager.find(TagEntity, {
      where: { accountBookId },
    });

    return tags;
  }

  async findOneByIdAndUserId(id: number, userId: number) {
    const tag = await this.dataSource.manager.findOne(TagEntity, {
      where: { id },
    });

    if (!tag) {
      throw new ResourceNotFoundException('标签不存在');
    }

    const accountBook = await this.dataSource
      .createQueryBuilder(AccountBookEntity, 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('accountBook.id = :accountBookId', {
        accountBookId: tag.accountBookId,
      })
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

    return tag;
  }
}
