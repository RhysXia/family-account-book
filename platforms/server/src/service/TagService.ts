import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { CategoryEntity } from '../entity/CategoryEntity';
import { FlowRecordEntity } from '../entity/FlowRecordEntity';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { TagEntity } from '../entity/TagEntity';
import { UserEntity } from '../entity/UserEntity';
import {
  InternalException,
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

      // 回去分类下的流水总额，添加回对应账号
      const totalFlowRecordAmount = await manager
        .createQueryBuilder(FlowRecordEntity, 'flowRecord')
        .select('SUM(flowRecord.amount)', 'totalAmount')
        .addSelect('flowRecord.savingAccountId', 'savingAccountId')
        .where('flowRecord.tagId = :tagId', { tagId: id })
        .groupBy('flowRecord.savingAccountId')
        .getRawMany<{ totalAmount: number; savingAccountId: number }>();

      const savingAccountIds = totalFlowRecordAmount.map(
        (it) => it.savingAccountId,
      );

      const savingAccounts = await manager.find(SavingAccountEntity, {
        where: {
          id: In(savingAccountIds),
        },
      });

      totalFlowRecordAmount.forEach((it) => {
        const savingAccount = savingAccounts.find(
          (s) => s.id === it.savingAccountId,
        );

        if (!savingAccount) {
          throw new InternalException(`账户(id: ${it.savingAccountId})不存在`);
        }

        savingAccount.amount -= it.totalAmount;

        if (savingAccount.amount < 0) {
          throw new ParameterException(
            `删除会导致账户${savingAccount.name}(id: ${savingAccount.id})余额小于0`,
          );
        }
      });

      await manager.save(savingAccounts);

      await manager.delete(FlowRecordEntity, {
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
      categoryId: number;
    },
    user: UserEntity,
  ) {
    return this.dataSource.manager.transaction(async (manager) => {
      const { name, desc, categoryId } = tagInput;

      const category = await manager
        .createQueryBuilder(CategoryEntity, 'category')
        .leftJoin('category.accountBook', 'accountBook')
        .leftJoin('accountBook.admins', 'admin')
        .leftJoin('accountBook.members', 'member')
        .where('category.id = :categoryId', {
          categoryId,
        })
        .andWhere('admin.id = :adminId OR member.id = :memberId', {
          adminId: user.id,
          memberId: user.id,
        })
        .getOne();

      if (!category) {
        throw new ResourceNotFoundException('分类不存在');
      }

      const tag = new TagEntity();

      tag.accountBookId = category.accountBookId;
      tag.name = name;
      tag.desc = desc;
      tag.category = category;
      tag.createdBy = user;
      tag.updatedBy = user;

      const count = await manager.count(TagEntity, {
        where: {
          categoryId,
        },
      });

      tag.order = count + 1;

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
    { categoryId }: { categoryId?: number },
    pagination?: Pagination,
  ): Promise<{ total: number; data: Array<TagEntity> }> {
    const qb = this.dataSource
      .createQueryBuilder(TagEntity, 'tag')
      .where('tag.accountBookId = :accountBookId', { accountBookId });

    if (categoryId) {
      qb.andWhere('tag.categoryId = :categoryId', { categoryId });
    }

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
