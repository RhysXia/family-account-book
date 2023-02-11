import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CategoryEntity } from '../../entity/CategoryEntity';
import { UserEntity } from '../../entity/UserEntity';
import { ResourceNotFoundException } from '../../exception/ServiceException';
import { CategoryService } from '../../service/CategoryService';
import { FlowRecordService } from '../../service/FlowRecordService';
import { AccountBookDataLoader } from '../dataloader/AccountBookDataLoader';
import { FlowRecordDataLoader } from '../dataloader/FlowRecordDataLoader';
import { UserDataLoader } from '../dataloader/UserDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import {
  CategoryFlowRecordFilter,
  CreateCategoryInput,
  Pagination,
  UpdateCategoryInput,
} from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, encodeId, EntityName } from '../utils';
import { getUserId } from '../utils/getUserId';

@Resolver('Category')
export class CategoryResolver {
  constructor(
    private readonly accountBookDataLoader: AccountBookDataLoader,
    private readonly userDataLoader: UserDataLoader,
    private readonly flowRecordService: FlowRecordService,
    private readonly categoryService: CategoryService,
    private readonly flowRecordDataLoader: FlowRecordDataLoader,
  ) {}

  @ResolveField()
  async statistics(@Parent() parent: GraphqlEntity<CategoryEntity>) {
    return {
      id: encodeId(
        EntityName.CATEGORY_STATISTICS,
        decodeId(EntityName.CATEGORY, parent.id),
      ),
    };
  }

  @ResolveField()
  async accountBook(@Parent() parent: GraphqlEntity<CategoryEntity>) {
    const accountBook =
      parent.accountBook ||
      (await this.accountBookDataLoader.load(parent.accountBookId));

    return accountBook
      ? {
          ...accountBook,
          id: encodeId(EntityName.ACCOUNT_BOOK, parent.accountBookId),
        }
      : null;
  }

  @ResolveField()
  async createdBy(@Parent() parent: GraphqlEntity<CategoryEntity>) {
    const createdBy =
      parent.createdBy || (await this.userDataLoader.load(parent.createdById));

    return createdBy
      ? { ...createdBy, id: encodeId(EntityName.USER, parent.createdById) }
      : null;
  }

  @ResolveField()
  async updatedBy(@Parent() parent: GraphqlEntity<CategoryEntity>) {
    const updatedBy =
      parent.updatedBy || (await this.userDataLoader.load(parent.updatedById));

    return updatedBy
      ? { ...updatedBy, id: encodeId(EntityName.USER, parent.updatedById) }
      : null;
  }

  @ResolveField()
  async flowRecords(
    @Parent() parent: GraphqlEntity<CategoryEntity>,
    @Args('filter') filter?: CategoryFlowRecordFilter,
    @Args('pagination') pagination?: Pagination,
  ) {
    const parentId = decodeId(EntityName.TAG, parent.id);

    const { traderId, savingAccountId, tagId } = filter || {};

    const { total, data } =
      await this.flowRecordService.findAllByConditionAndPagination(
        {
          ...(traderId && {
            traderId: getUserId(traderId),
          }),
          ...(savingAccountId && {
            savingAccountId: decodeId(
              EntityName.SAVING_ACCOUNT,
              savingAccountId,
            ),
          }),
          ...(tagId && {
            tagId: decodeId(EntityName.TAG, tagId),
          }),
          categoryId: parentId,
        },
        pagination,
      );

    return {
      total,
      data: data.map((it) => ({
        ...it,
        id: encodeId(EntityName.FLOW_RECORD, it.id),
      })),
    };
  }

  @ResolveField()
  async flowRecord(
    @Parent() parent: GraphqlEntity<CategoryEntity>,
    @Args('id') id: string,
  ) {
    const flowRecord = await this.flowRecordDataLoader.load(
      decodeId(EntityName.FLOW_RECORD, id),
    );

    if (!flowRecord) {
      throw new ResourceNotFoundException('流水不存在');
    }

    const encodedCategoryId = encodeId(
      EntityName.CATEGORY,
      flowRecord.categoryId,
    );

    if (encodedCategoryId !== parent.id) {
      // 不暴露其他数据信息，一律提示资源不存在
      throw new ResourceNotFoundException('流水不存在');
    }
    return { ...flowRecord, id };
  }

  @Mutation()
  async createCategory(
    @Args('category') categoryInput: CreateCategoryInput,
    @CurrentUser({ required: true }) currentUser: UserEntity,
  ): Promise<GraphqlEntity<CategoryEntity>> {
    const { name, desc, type, accountBookId } = categoryInput;

    const category = await this.categoryService.create(
      {
        name,
        type,
        accountBookId: decodeId(EntityName.ACCOUNT_BOOK, accountBookId),
        ...(desc && { desc }),
      },
      currentUser,
    );

    return {
      ...category,
      id: encodeId(EntityName.CATEGORY, category.id),
    };
  }

  @Mutation()
  async updateCategory(
    @Args('category') categoryInput: UpdateCategoryInput,
    @CurrentUser({ required: true }) currentUser: UserEntity,
  ): Promise<GraphqlEntity<CategoryEntity>> {
    const { id, name, desc } = categoryInput;

    const category = await this.categoryService.update(
      decodeId(EntityName.CATEGORY, id),
      {
        ...(name && { name }),
        ...(desc && { desc }),
      },
      currentUser,
    );

    return {
      ...category,
      id,
    };
  }

  @Mutation()
  async deleteCategory(
    @Args('id') id: string,
    @CurrentUser({ required: true }) currentUser: UserEntity,
  ) {
    await this.categoryService.delete(
      decodeId(EntityName.CATEGORY, id),
      currentUser,
    );

    return true;
  }
}
