import {
  Args,
  Parent,
  ResolveField,
  Resolver,
  Mutation,
} from '@nestjs/graphql';
import { TagEntity } from '../../entity/TagEntity';
import { UserEntity } from '../../entity/UserEntity';
import { ResourceNotFoundException } from '../../exception/ServiceException';
import { FlowRecordService } from '../../service/FlowRecordService';
import { TagService } from '../../service/TagService';
import { AccountBookDataLoader } from '../dataloader/AccountBookDataLoader';
import { CategoryDataLoader } from '../dataloader/CategoryDataLoader';
import { FlowRecordDataLoader } from '../dataloader/FlowRecordDataLoader';
import { UserDataLoader } from '../dataloader/UserDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import {
  CreateTagInput,
  TagFlowRecordFilter,
  Pagination,
  UpdateTagInput,
} from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, encodeId, EntityName } from '../utils';
import { getUserId } from '../utils/getUserId';

@Resolver('Tag')
export class TagResolver {
  constructor(
    private readonly userDataLoader: UserDataLoader,
    private readonly categoryDataLoader: CategoryDataLoader,
    private readonly accountBookDataLoader: AccountBookDataLoader,
    private readonly tagService: TagService,
    private readonly flowRecordDataLoader: FlowRecordDataLoader,
    private readonly flowRecordService: FlowRecordService,
  ) {}

  @ResolveField()
  async category(@Parent() parent: GraphqlEntity<TagEntity>) {
    const category =
      parent.category ||
      (await this.categoryDataLoader.load(parent.categoryId));

    return category
      ? { ...category, id: encodeId(EntityName.CATEGORY, parent.categoryId) }
      : null;
  }

  @ResolveField()
  async creator(@Parent() parent: GraphqlEntity<TagEntity>) {
    const creator =
      parent.creator || (await this.userDataLoader.load(parent.creatorId));

    return creator
      ? { ...creator, id: encodeId(EntityName.USER, parent.creatorId) }
      : null;
  }

  @ResolveField()
  async updater(@Parent() parent: GraphqlEntity<TagEntity>) {
    const updater =
      parent.updater || (await this.userDataLoader.load(parent.updaterId));

    return updater
      ? { ...updater, id: encodeId(EntityName.USER, parent.updaterId) }
      : null;
  }

  @ResolveField()
  async accountBook(@Parent() parent: GraphqlEntity<TagEntity>) {
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
  async flowRecords(
    @Parent() parent: GraphqlEntity<TagEntity>,
    @Args('filter') filter?: TagFlowRecordFilter,
    @Args('pagination') pagination?: Pagination,
  ) {
    const parentId = decodeId(EntityName.TAG, parent.id);

    const { traderId, savingAccountId } = filter || {};

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
          tagId: parentId,
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
    @Parent() parent: GraphqlEntity<TagEntity>,
    @Args('id') id: string,
  ) {
    const flowRecord = await this.flowRecordDataLoader.load(
      decodeId(EntityName.FLOW_RECORD, id),
    );

    if (!flowRecord) {
      throw new ResourceNotFoundException('???????????????');
    }

    const encodedSavingAccountId = encodeId(
      EntityName.SAVING_ACCOUNT,
      flowRecord.savingAccountId,
    );

    if (encodedSavingAccountId !== parent.id) {
      // ?????????????????????????????????????????????????????????
      throw new ResourceNotFoundException('???????????????');
    }
    return { ...flowRecord, id };
  }

  @Mutation()
  async createTag(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('tag') tag: CreateTagInput,
  ) {
    const { name, desc, categoryId } = tag;

    const entity = await this.tagService.create(
      {
        categoryId: decodeId(EntityName.CATEGORY, categoryId),
        name,
        ...(desc && { desc }),
      },
      currentUser,
    );
    return {
      ...entity,
      id: encodeId(EntityName.TAG, entity.id),
    };
  }

  @Mutation()
  async updateTag(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('tag') tag: UpdateTagInput,
  ) {
    const { name, desc, categoryId } = tag;

    const entity = await this.tagService.update(
      decodeId(EntityName.TAG, tag.id),
      {
        ...(name && { name }),
        ...(desc && { desc }),
        ...(categoryId && {
          categoryId: decodeId(EntityName.CATEGORY, categoryId),
        }),
      },
      currentUser,
    );
    return {
      ...entity,
      id: tag.id,
    };
  }

  @Mutation()
  async deleteTag(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('id') id: string,
  ) {
    await this.tagService.delete(decodeId(EntityName.TAG, id), currentUser);
    return true;
  }
}
