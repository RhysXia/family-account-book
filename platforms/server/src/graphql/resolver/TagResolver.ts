import {
  Query,
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
  async creator(@Parent() parent: TagEntity) {
    if (parent.creator) {
      return parent.creator;
    }
    return this.userDataLoader.load(parent.creatorId);
  }

  @ResolveField()
  async updater(@Parent() parent: TagEntity) {
    if (parent.updater) {
      return parent.updater;
    }
    return this.userDataLoader.load(parent.updaterId);
  }

  @ResolveField()
  async accountBook(@Parent() parent: TagEntity) {
    if (parent.accountBook) {
      return parent.accountBook;
    }
    return this.accountBookDataLoader.load(parent.accountBookId);
  }

  @ResolveField()
  async flowRecords(
    @Parent() parent: TagEntity,
    @Args('pagination') pagination?: Pagination,
  ) {
    return this.flowRecordService.findAllByTagIdAndPagination(
      parent.id,
      pagination,
    );
  }

  @ResolveField()
  async flowRecord(@Parent() parent: TagEntity, @Args('id') id: number) {
    const flowRecord = await this.flowRecordDataLoader.load(id);
    if (!flowRecord || flowRecord.tagId !== parent.id) {
      throw new ResourceNotFoundException('流水不存在');
    }
    return flowRecord;
  }

  @Query()
  getAuthTagsByAccountBookId(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('accountBookId') accountBookId: number,
    @Args('pagination') pagination?: Pagination,
  ) {
    return this.tagService.findAllByAccountBookIdAndUserIdAndPagination(
      accountBookId,
      currentUser.id,
      pagination,
    );
  }

  @Query()
  getAuthTagById(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('id') id: number,
  ) {
    return this.tagService.findOneByIdAndUserId(id, currentUser.id);
  }

  @Mutation()
  createTag(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('tag') tag: CreateTagInput,
  ) {
    return this.tagService.create(tag, currentUser);
  }

  @Mutation()
  updateTag(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('tag') tag: UpdateTagInput,
  ) {
    return this.tagService.update(tag, currentUser);
  }

  @Mutation()
  async deleteTag(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('id') id: number,
  ) {
    await this.tagService.delete(id, currentUser);
    return true;
  }
}
