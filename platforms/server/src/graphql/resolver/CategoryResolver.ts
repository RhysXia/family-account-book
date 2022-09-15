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
import { TagService } from '../../service/TagService';
import { AccountBookDataLoader } from '../dataloader/AccountBookDataLoader';
import { TagDataLoader } from '../dataloader/TagDataLoader';
import { UserDataLoader } from '../dataloader/UserDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import {
  CreateCategoryInput,
  Pagination,
  UpdateCategoryInput,
} from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, encodeId, EntityName } from '../utils';

@Resolver('Category')
export class CategoryResolver {
  constructor(
    private readonly accountBookDataLoader: AccountBookDataLoader,
    private readonly userDataLoader: UserDataLoader,
    private readonly tagDataLoader: TagDataLoader,
    private readonly tagService: TagService,
    private readonly categoryService: CategoryService,
  ) {}

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
  async tags(
    @Parent() parent: GraphqlEntity<CategoryEntity>,
    @Args('pagination') pagination?: Pagination,
  ) {
    const parentId = decodeId(EntityName.CATEGORY, parent.id);

    const { total, data } =
      await this.tagService.findAllByCategoryIdAndPagination(
        parentId,
        pagination,
      );

    return {
      total,
      data: data.map((it) => ({
        ...it,
        id: encodeId(EntityName.TAG, it.id),
      })),
    };
  }

  @ResolveField()
  async tag(
    @Parent() parent: GraphqlEntity<CategoryEntity>,
    @Args('id') id: string,
  ) {
    const tag = await this.tagDataLoader.load(decodeId(EntityName.TAG, id));

    if (!tag) {
      throw new ResourceNotFoundException('标签不存在');
    }

    const encodedCategoryId = encodeId(EntityName.CATEGORY, tag.categoryId);

    if (encodedCategoryId !== parent.id) {
      // 不暴露其他数据信息，一律提示资源不存在
      throw new ResourceNotFoundException('标签不存在');
    }
    return { ...tag, id };
  }

  @ResolveField()
  async creator(@Parent() parent: GraphqlEntity<CategoryEntity>) {
    const creator =
      parent.creator || (await this.userDataLoader.load(parent.creatorId));

    return creator
      ? { ...creator, id: encodeId(EntityName.USER, parent.creatorId) }
      : null;
  }

  @ResolveField()
  async updater(@Parent() parent: GraphqlEntity<CategoryEntity>) {
    const updater =
      parent.updater || (await this.userDataLoader.load(parent.updaterId));

    return updater
      ? { ...updater, id: encodeId(EntityName.USER, parent.updaterId) }
      : null;
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
