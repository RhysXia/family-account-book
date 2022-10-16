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
import { SavingAccountDataLoader } from '../dataloader/SavingAccountDataLoader';
import { TagDataLoader } from '../dataloader/TagDataLoader';
import { UserDataLoader } from '../dataloader/UserDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import { CreateFlowRecordInput, UpdateFlowRecordInput } from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, encodeId, EntityName } from '../utils';
import { getUserId } from '../utils/getUserId';

@Resolver('FlowRecord')
export class FlowRecordResolver {
  constructor(
    private readonly userDataLoader: UserDataLoader,
    private readonly accountBookDataLoader: AccountBookDataLoader,
    private readonly savingAccountDataLoader: SavingAccountDataLoader,
    private readonly flowRecordService: FlowRecordService,
    private readonly tagDataLoader: TagDataLoader,
  ) {}

  @ResolveField()
  async trader(@Parent() parent: GraphqlEntity<FlowRecordEntity>) {
    const trader =
      parent.trader || (await this.userDataLoader.load(parent.traderId));

    return trader
      ? { ...trader, id: encodeId(EntityName.USER, parent.traderId) }
      : null;
  }

  @ResolveField()
  async creator(@Parent() parent: GraphqlEntity<FlowRecordEntity>) {
    const creator =
      parent.creator || (await this.userDataLoader.load(parent.creatorId));

    return creator
      ? { ...creator, id: encodeId(EntityName.USER, parent.creatorId) }
      : null;
  }

  @ResolveField()
  async updater(@Parent() parent: GraphqlEntity<FlowRecordEntity>) {
    const updater =
      parent.updater || (await this.userDataLoader.load(parent.updaterId));

    return updater
      ? { ...updater, id: encodeId(EntityName.USER, parent.updaterId) }
      : null;
  }

  @ResolveField()
  async accountBook(@Parent() parent: GraphqlEntity<FlowRecordEntity>) {
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
  async savingAccount(@Parent() parent: GraphqlEntity<FlowRecordEntity>) {
    const savingAccount =
      parent.savingAccount ||
      (await this.savingAccountDataLoader.load(parent.savingAccountId));

    return savingAccount
      ? {
          ...savingAccount,
          id: encodeId(EntityName.SAVING_ACCOUNT, parent.savingAccountId),
        }
      : null;
  }

  @ResolveField()
  async tag(@Parent() parent: GraphqlEntity<FlowRecordEntity>) {
    const tag = parent.tag || (await this.tagDataLoader.load(parent.tagId));

    return tag ? { ...tag, id: encodeId(EntityName.TAG, parent.tagId) } : null;
  }

  @Mutation()
  async createFlowRecord(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('flowRecord') flowRecord: CreateFlowRecordInput,
  ) {
    const { savingAccountId, tagId, traderId, desc, ...others } = flowRecord;

    const entity = await this.flowRecordService.create(
      {
        ...others,
        ...(desc && {
          desc,
        }),
        traderId: getUserId(traderId),
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
    const { id, savingAccountId, tagId, traderId, desc, dealAt, amount } =
      flowRecord;

    const updatedFlowRecord: Partial<FlowRecordEntity> = {};

    if (desc) {
      updatedFlowRecord.desc = desc;
    }
    if (dealAt) {
      updatedFlowRecord.dealAt = dealAt;
    }
    if (amount) {
      updatedFlowRecord.amount = amount;
    }

    if (traderId) {
      updatedFlowRecord.traderId = getUserId(traderId);
    }

    if (savingAccountId) {
      updatedFlowRecord.savingAccountId = decodeId(
        EntityName.SAVING_ACCOUNT,
        savingAccountId,
      );
    }

    if (tagId) {
      updatedFlowRecord.tagId = decodeId(EntityName.TAG, tagId);
    }

    const entity = await this.flowRecordService.update(
      decodeId(EntityName.FLOW_RECORD, id),
      updatedFlowRecord,
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
