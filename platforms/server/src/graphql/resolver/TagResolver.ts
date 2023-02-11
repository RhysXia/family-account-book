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
    private readonly accountBookDataLoader: AccountBookDataLoader,
    private readonly tagService: TagService,
    private readonly flowRecordDataLoader: FlowRecordDataLoader,
    private readonly flowRecordService: FlowRecordService,
  ) {}

  @ResolveField()
  async createdBy(@Parent() parent: GraphqlEntity<TagEntity>) {
    const createdBy =
      parent.createdBy || (await this.userDataLoader.load(parent.createdById));

    return createdBy
      ? { ...createdBy, id: encodeId(EntityName.USER, parent.createdById) }
      : null;
  }

  @ResolveField()
  async updatedBy(@Parent() parent: GraphqlEntity<TagEntity>) {
    const updatedBy =
      parent.updatedBy || (await this.userDataLoader.load(parent.updatedById));

    return updatedBy
      ? { ...updatedBy, id: encodeId(EntityName.USER, parent.updatedById) }
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

    const { traderId, savingAccountId, categoryId } = filter || {};
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
          ...(categoryId && {
            categoryId: decodeId(EntityName.CATEGORY, categoryId),
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
      throw new ResourceNotFoundException('流水不存在');
    }

    const parentId = decodeId(EntityName.TAG, parent.id);

    const tags = await this.tagService.findAllByFlowRecordId(flowRecord.id);

    if (tags.every((it) => it.id !== parentId)) {
      throw new ResourceNotFoundException('流水不存在');
    }

    return { ...flowRecord, id };
  }

  @Mutation()
  async createTag(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('tag') tag: CreateTagInput,
  ) {
    const { name, desc, accountBookId } = tag;

    const entity = await this.tagService.create(
      {
        accountBookId: decodeId(EntityName.ACCOUNT_BOOK, accountBookId),
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
    const { name, desc } = tag;

    const entity = await this.tagService.update(
      decodeId(EntityName.TAG, tag.id),
      {
        ...(name && { name }),
        ...(desc && { desc }),
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
