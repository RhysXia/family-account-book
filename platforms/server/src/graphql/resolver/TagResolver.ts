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
import { CreateTagInput, Pagination, UpdateTagInput } from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, encodeId, EntityName } from '../utils';

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
  async creator(@Parent() parent: GraphqlEntity<TagEntity>) {
    const creatorId = encodeId(EntityName.USER, parent.creatorId);

    const creator =
      parent.creator || (await this.userDataLoader.load(creatorId));

    return creator ? { ...creator, id: creatorId } : null;
  }

  @ResolveField()
  async updater(@Parent() parent: GraphqlEntity<TagEntity>) {
    const updaterId = encodeId(EntityName.USER, parent.updaterId);

    const updater =
      parent.updater || (await this.userDataLoader.load(updaterId));

    return updater ? { ...updater, id: updaterId } : null;
  }

  @ResolveField()
  async accountBook(@Parent() parent: GraphqlEntity<TagEntity>) {
    const accountBookId = encodeId(
      EntityName.ACCOUNT_BOOK,
      parent.accountBookId,
    );

    const accountBook =
      parent.accountBook ||
      (await this.accountBookDataLoader.load(accountBookId));

    return accountBook ? { ...accountBook, id: accountBookId } : null;
  }

  @ResolveField()
  async flowRecords(
    @Parent() parent: GraphqlEntity<TagEntity>,
    @Args('pagination') pagination?: Pagination,
  ) {
    const { total, data } =
      await this.flowRecordService.findAllByTagIdAndPagination(
        decodeId(EntityName.TAG, parent.id),
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
    const flowRecord = await this.flowRecordDataLoader.load(id);

    if (!flowRecord) {
      throw new ResourceNotFoundException('流水不存在');
    }

    const encodedSavingAccountId = encodeId(
      EntityName.SAVING_ACCOUNT,
      flowRecord.savingAccountId,
    );

    if (encodedSavingAccountId !== parent.id) {
      // 不暴露其他数据信息，一律提示资源不存在
      throw new ResourceNotFoundException('流水不存在');
    }
    return { ...flowRecord, id };
  }

  @Mutation()
  async createTag(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('tag') tag: CreateTagInput,
  ) {
    const entity = await this.tagService.create(
      {
        ...tag,
        accountBookId: decodeId(EntityName.ACCOUNT_BOOK, tag.accountBookId),
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
    const entity = await this.tagService.update(
      decodeId(EntityName.TAG, tag.id),
      tag,
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
