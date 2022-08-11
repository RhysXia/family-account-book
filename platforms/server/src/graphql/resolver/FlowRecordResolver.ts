import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { FlowRecordEntity } from '../../entity/FlowRecordEntity';
import { AccountBookDataLoader } from '../dataloader/AccountBookDataLoader';
import { UserDataLoader } from '../dataloader/UserDataLoader';

@Resolver('FlowRecord')
export class FlowRecordResolver {
  constructor(
    private readonly userDataLoader: UserDataLoader,
    private readonly accountBookDataLoader: AccountBookDataLoader,
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
    if (parent.updater) {
      return parent.accountBook;
    }
    return this.accountBookDataLoader.load(parent.accountBookId);
  }
}
