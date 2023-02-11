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
import { TagService } from '../../service/TagService';
import { AccountBookDataLoader } from '../dataloader/AccountBookDataLoader';
import { CategoryDataLoader } from '../dataloader/CategoryDataLoader';
import { SavingAccountDataLoader } from '../dataloader/SavingAccountDataLoader';
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
    private readonly categoryDataLoader: CategoryDataLoader,
    private readonly flowRecordService: FlowRecordService,
    private readonly tagService: TagService,
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
  async createdBy(@Parent() parent: GraphqlEntity<FlowRecordEntity>) {
    const createdBy =
      parent.createdBy || (await this.userDataLoader.load(parent.createdById));

    return createdBy
      ? { ...createdBy, id: encodeId(EntityName.USER, parent.createdById) }
      : null;
  }

  @ResolveField()
  async updatedBy(@Parent() parent: GraphqlEntity<FlowRecordEntity>) {
    const updatedBy =
      parent.updatedBy || (await this.userDataLoader.load(parent.updatedById));

    return updatedBy
      ? { ...updatedBy, id: encodeId(EntityName.USER, parent.updatedById) }
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
  async category(@Parent() parent: GraphqlEntity<FlowRecordEntity>) {
    const category =
      parent.category ||
      (await this.categoryDataLoader.load(parent.categoryId));

    return category
      ? {
          ...category,
          id: encodeId(EntityName.CATEGORY, parent.categoryId),
        }
      : null;
  }

  @ResolveField()
  async tags(@Parent() parent: GraphqlEntity<FlowRecordEntity>) {
    const tags =
      parent.tags ||
      (await this.tagService.findAllByFlowRecordId(
        decodeId(EntityName.FLOW_RECORD, parent.id),
      ));

    return tags.map((it) => ({ ...it, id: encodeId(EntityName.TAG, it.id) }));
  }

  @Mutation()
  async createFlowRecord(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('flowRecord') flowRecord: CreateFlowRecordInput,
  ) {
    const { savingAccountId, tagIds, categoryId, traderId, desc, ...others } =
      flowRecord;

    const entity = await this.flowRecordService.create(
      {
        ...others,
        ...(desc && {
          desc,
        }),
        traderId: getUserId(traderId),
        savingAccountId: decodeId(EntityName.SAVING_ACCOUNT, savingAccountId),
        categoryId: decodeId(EntityName.CATEGORY, categoryId),
        tagIds: tagIds.map((it) => decodeId(EntityName.TAG, it)),
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
    const {
      id,
      savingAccountId,
      tagIds,
      categoryId,
      traderId,
      desc,
      dealAt,
      amount,
    } = flowRecord;

    const entity = await this.flowRecordService.update(
      decodeId(EntityName.FLOW_RECORD, id),
      {
        ...(desc && {
          desc,
        }),
        ...(dealAt && {
          dealAt,
        }),
        ...(amount && {
          amount,
        }),
        ...(traderId && {
          traderId: getUserId(traderId),
        }),
        ...(savingAccountId && {
          savingAccountId: decodeId(EntityName.SAVING_ACCOUNT, savingAccountId),
        }),
        ...(categoryId && {
          categoryId: decodeId(EntityName.CATEGORY, categoryId),
        }),
        ...(tagIds && {
          tagIds: tagIds.map((it) => decodeId(EntityName.TAG, it)),
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
