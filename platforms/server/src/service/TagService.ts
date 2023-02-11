import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { FlowRecordEntity } from '../entity/FlowRecordEntity';
import { RelationTagFlowRecord } from '../entity/RelationTagFlowRecord';
import { TagEntity } from '../entity/TagEntity';
import { UserEntity } from '../entity/UserEntity';
import { ResourceNotFoundException } from '../exception/ServiceException';
import { Pagination } from '../graphql/graphql';
import { applyPagination } from '../utils/applyPagination';

@Injectable()
export class TagService {
  constructor(private readonly dataSource: DataSource) {}

  async findAllByFlowRecordId(flowRecordId: number) {
    const flowRecord = await this.dataSource.manager.findOne(FlowRecordEntity, {
      select: {
        tags: true,
      },
      relations: {
        tags: true,
      },
      where: {
        id: flowRecordId,
      },
    });

    if (!flowRecord) {
      throw new ResourceNotFoundException('流水不存在');
    }

    return flowRecord.tags;
  }

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

      await manager.delete(RelationTagFlowRecord, {
        tagId: id,
      });

      await manager.delete(TagEntity, { id });
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

      tagEntity.updatedBy = user;

      return manager.save(tagEntity);
    });
  }

  async create(
    tagInput: {
      name: string;
      desc?: string;
      accountBookId: number;
    },
    user: UserEntity,
  ) {
    return this.dataSource.manager.transaction(async (manager) => {
      const { name, desc, accountBookId } = tagInput;

      const accountBook = await manager
        .createQueryBuilder(AccountBookEntity, 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('accountBook.id = :accountBookId', {
          accountBookId,
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
      tag.accountBook = accountBook;
      tag.createdBy = user;
      tag.updatedBy = user;

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
