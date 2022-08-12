import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { FlowRecordEntity } from '../../entity/FlowRecordEntity';
import { UserEntity } from '../../entity/UserEntity';
import { FlowRecordService } from '../../service/FlowRecordService';
import { AccountBookDataLoader } from '../dataloader/AccountBookDataLoader';
import { TagDataLoader } from '../dataloader/TagDataLoader';
import { UserDataLoader } from '../dataloader/UserDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import { CreateFlowRecordInput, UpdateFlowRecordInput } from '../graphql';

@Resolver('FlowRecord')
export class FlowRecordResolver {
  constructor(
    private readonly userDataLoader: UserDataLoader,
    private readonly accountBookDataLoader: AccountBookDataLoader,
    private readonly tagDataLoader: TagDataLoader,
    private readonly flowRecordService: FlowRecordService,
  ) {}

  @ResolveField()
  async creator(@Parent() parent: FlowRecordEntity) {
    if (parent.creator) {
      return parent.creator;
    }
    return this.userDataLoader.load(parent.creatorId);
  }

  @ResolveField()
  async updater(@Parent() parent: FlowRecordEntity) {
    if (parent.updater) {
      return parent.updater;
    }
    return this.userDataLoader.load(parent.updaterId);
  }

  @ResolveField()
  async accountBook(@Parent() parent: FlowRecordEntity) {
    if (parent.accountBook) {
      return parent.accountBook;
    }
    return this.accountBookDataLoader.load(parent.accountBookId);
  }

  @ResolveField()
  async tag(@Parent() parent: FlowRecordEntity) {
    if (parent.tag) {
      return parent.tag;
    }
    return this.tagDataLoader.load(parent.tagId);
  }

  @Mutation()
  createFlowRecord(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('flowRecord') flowRecord: CreateFlowRecordInput,
  ) {
    return this.flowRecordService.create(flowRecord, currentUser);
  }

  @Mutation()
  updateFlowRecord(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('flowRecord') flowRecord: UpdateFlowRecordInput,
  ) {
    return this.flowRecordService.update(flowRecord, currentUser);
  }
}
