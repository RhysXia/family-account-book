import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { CategoryEntity } from '../entity/CategoryEntity';
import { FlowRecordEntity } from '../entity/FlowRecordEntity';
import { TagEntity } from '../entity/TagEntity';
import { UserEntity } from '../entity/UserEntity';
import {
  ParameterException,
  ResourceNotFoundException,
} from '../exception/ServiceException';
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
        throw new ResourceNotFoundException('标签不存在');
      }

      const flowRecord = await manager.find(FlowRecordEntity, {
        where: {
          tagId: tag.id,
        },
      });

      if (flowRecord) {
        throw new ParameterException('存在流水关联该标签，无法删除');
      }

      // 软删除
      await manager.remove(tag);
    });
  }

  update(
    id: number,
    tag: {
      name?: string;
      desc?: string;
    },
    user: UserEntity,
  ) {
    const { desc, name } = tag;
    return this.dataSource.manager.transaction(async (manager) => {
      let tagEntity: TagEntity;
      try {
        tagEntity = await manager.findOneOrFail(TagEntity, {
          where: { id },
        });
      } catch (err) {
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
        throw new ResourceNotFoundException('标签不存在');
      }

      if (name) {
        tagEntity.name = name;
      }

      if (desc) {
        tagEntity.desc = desc;
      }

      tagEntity.updater = user;

      return manager.save(tagEntity);
    });
  }

  async create(
    tagInput: {
      name: string;
      desc?: string;
      categoryId: number;
    },
    user: UserEntity,
  ) {
    return this.dataSource.manager.transaction(async (manager) => {
      const { categoryId, name, desc } = tagInput;

      let category: CategoryEntity;
      try {
        category = await manager.findOneOrFail(CategoryEntity, {
          where: {
            id: categoryId,
          },
        });
      } catch (err) {
        throw new ResourceNotFoundException('分类不存在');
      }

      const accountBook = await manager
        .createQueryBuilder(AccountBookEntity, 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('accountBook.id = :accountBookId', {
          accountBookId: category.accountBookId,
        })
        .andWhere('admin.id = :adminId OR member.id = :memberId', {
          adminId: user.id,
          memberId: user.id,
        })
        .getOne();

      if (!accountBook) {
        throw new ResourceNotFoundException('分类不存在');
      }

      const tag = new TagEntity();

      tag.name = name;
      tag.desc = desc;
      tag.category = category;
      tag.accountBook = accountBook;
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

  async findAllByCategoryIdAndPagination(
    categoryId: number,
    pagination?: Pagination,
  ): Promise<{ total: number; data: Array<TagEntity> }> {
    const qb = this.dataSource
      .createQueryBuilder(TagEntity, 'tag')
      .where('tag.categoryId = :categoryId', { categoryId });

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

  async findAllByAccountBookIdAndPagination(
    accountBookId: number,
    pagination?: Pagination,
  ): Promise<{ total: number; data: Array<TagEntity> }> {
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
