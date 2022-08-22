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
import { UserDataLoader } from '../dataloader/UserDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import { CreateFlowRecordInput, UpdateFlowRecordInput } from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, encodeId, EntityName } from '../utils';

@Resolver('FlowRecord')
export class FlowRecordResolver {
  constructor(
    private readonly userDataLoader: UserDataLoader,
    private readonly accountBookDataLoader: AccountBookDataLoader,
    private readonly flowRecordService: FlowRecordService,
  ) {}

  @ResolveField()
  async creator(@Parent() parent: GraphqlEntity<FlowRecordEntity>) {
    const creatorId = encodeId(EntityName.USER, parent.creatorId);

    const creator =
      parent.creator || (await this.userDataLoader.load(creatorId));

    return creator ? { ...creator, id: creatorId } : null;
  }

  @ResolveField()
  async updater(@Parent() parent: GraphqlEntity<FlowRecordEntity>) {
    const updaterId = encodeId(EntityName.USER, parent.updaterId);

    const updater =
      parent.updater || (await this.userDataLoader.load(updaterId));

    return updater ? { ...updater, id: updaterId } : null;
  }

  @ResolveField()
  async accountBook(@Parent() parent: GraphqlEntity<FlowRecordEntity>) {
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
  async savingAccount(@Parent() parent: GraphqlEntity<FlowRecordEntity>) {
    const savingAccountId = encodeId(
      EntityName.ACCOUNT_BOOK,
      parent.savingAccountId,
    );

    const savingAccount =
      parent.savingAccount ||
      (await this.accountBookDataLoader.load(savingAccountId));

    return savingAccount ? { ...savingAccount, id: savingAccountId } : null;
  }

  @ResolveField()
  async tag(@Parent() parent: GraphqlEntity<FlowRecordEntity>) {
    const tagId = encodeId(EntityName.TAG, parent.tagId);

    const tag = parent.tag || (await this.accountBookDataLoader.load(tagId));

    return tag ? { ...tag, id: tagId } : null;
  }

  @Mutation()
  async createFlowRecord(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('flowRecord') flowRecord: CreateFlowRecordInput,
  ) {
    const { savingAccountId, tagId, ...others } = flowRecord;

    const entity = await this.flowRecordService.create(
      {
        ...others,
        savingAccountId: decodeId(EntityName.SAVING_ACCOUNT, savingAccountId),
        tagId: decodeId(EntityName.TAG, tagId),
      },
      currentUser,
    );

    return {
      ...entity,
      id: encodeId(EntityName.FLOW_RECORD, entity.id),
    };
  }

  @Mutation()
  async updateFlowRecord(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('flowRecord') flowRecord: UpdateFlowRecordInput,
  ) {
    const { id, savingAccountId, tagId, ...others } = flowRecord;

    const entity = await this.flowRecordService.update(
      decodeId(EntityName.FLOW_RECORD, id),
      {
        ...others,
        ...(savingAccountId && {
          savingAccountId: decodeId(EntityName.SAVING_ACCOUNT, savingAccountId),
        }),
        ...(tagId && {
          tagId: decodeId(EntityName.TAG, tagId),
        }),
      },
      currentUser,
    );
    return {
      ...entity,
      id: flowRecord.id,
    };
  }

  @Mutation()
  async deleteFlowRecord(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('id') id: string,
  ) {
    await this.flowRecordService.delete(
      decodeId(EntityName.FLOW_RECORD, id),
      currentUser,
    );
    return true;
  }
}
