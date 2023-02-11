import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { SavingAccountEntity } from '../../entity/SavingAccountEntity';
import { UserEntity } from '../../entity/UserEntity';
import { ResourceNotFoundException } from '../../exception/ServiceException';
import { FlowRecordService } from '../../service/FlowRecordService';
import { SavingAccountService } from '../../service/SavingAccountService';
import { AccountBookDataLoader } from '../dataloader/AccountBookDataLoader';
import { FlowRecordDataLoader } from '../dataloader/FlowRecordDataLoader';
import { UserDataLoader } from '../dataloader/UserDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import {
  CreateSavingAccountInput,
  SavingAccountFlowRecordFilter,
  Pagination,
  UpdateSavingAccountInput,
} from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, encodeId, EntityName } from '../utils';
import { getUserId } from '../utils/getUserId';

@Resolver('SavingAccount')
export class SavingAccountResolver {
  constructor(
    private readonly savingAccountService: SavingAccountService,
    private readonly userDataLoader: UserDataLoader,
    private readonly accountBookDataLoader: AccountBookDataLoader,
    private readonly flowRecordDataLoader: FlowRecordDataLoader,
    private readonly flowRecordService: FlowRecordService,
  ) {}

  @ResolveField()
  async accountBook(@Parent() parent: GraphqlEntity<SavingAccountEntity>) {
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
  async createdBy(@Parent() parent: GraphqlEntity<SavingAccountEntity>) {
    const createdBy =
      parent.createdBy || (await this.userDataLoader.load(parent.createdById));

    return createdBy
      ? { ...createdBy, id: encodeId(EntityName.USER, parent.createdById) }
      : null;
  }

  @ResolveField()
  async updatedBy(@Parent() parent: GraphqlEntity<SavingAccountEntity>) {
    const updatedBy =
      parent.updatedBy || (await this.userDataLoader.load(parent.updatedById));

    return updatedBy
      ? { ...updatedBy, id: encodeId(EntityName.USER, parent.updatedById) }
      : null;
  }

  @ResolveField()
  async flowRecords(
    @Parent() parent: GraphqlEntity<SavingAccountEntity>,
    @Args('filter') filter?: SavingAccountFlowRecordFilter,
    @Args('pagination') pagination?: Pagination,
  ) {
    const parentId = decodeId(EntityName.SAVING_ACCOUNT, parent.id);

    const { traderId, tagId } = filter || {};

    const { total, data } =
      await this.flowRecordService.findAllByConditionAndPagination(
        {
          ...(traderId && {
            traderId: getUserId(traderId),
          }),
          ...(tagId && { tagId: decodeId(EntityName.TAG, tagId) }),
          savingAccountId: parentId,
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
    @Parent() parent: GraphqlEntity<SavingAccountEntity>,
    @Args('id') id: string,
  ) {
    const flowRecord = await this.flowRecordDataLoader.load(
      decodeId(EntityName.FLOW_RECORD, id),
    );

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
  async createSavingAccount(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('savingAccount') savingsInput: CreateSavingAccountInput,
  ) {
    const { accountBookId, desc, ...others } = savingsInput;

    const entity = await this.savingAccountService.create(
      {
        ...others,
        ...(desc && { desc }),
        accountBookId: decodeId(EntityName.ACCOUNT_BOOK, accountBookId),
      },
      user,
    );

    return {
      ...entity,
      id: encodeId(EntityName.SAVING_ACCOUNT, entity.id),
    };
  }

  @Mutation()
  async updateSavingAccount(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('savingAccount') savingsInput: UpdateSavingAccountInput,
  ) {
    const { id, name, desc, amount } = savingsInput;

    const entity = await this.savingAccountService.update(
      decodeId(EntityName.SAVING_ACCOUNT, id),
      {
        ...(name && { name }),
        ...(desc && { desc }),
        ...(amount && { amount }),
      },
      user,
    );

    return {
      ...entity,
      id: savingsInput.id,
    };
  }

  @Mutation()
  async deleteSavingAccount(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('id') id: string,
  ) {
    await this.savingAccountService.delete(
      decodeId(EntityName.SAVING_ACCOUNT, id),
      currentUser,
    );
    return true;
  }
}
