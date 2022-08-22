import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { SavingAccountAmountView } from '../../entity/SavingAccountAmountView';
import { SavingAccountEntity } from '../../entity/SavingAccountEntity';
import { UserEntity } from '../../entity/UserEntity';
import { ResourceNotFoundException } from '../../exception/ServiceException';
import { FlowRecordService } from '../../service/FlowRecordService';
import { SavingAccountAmountService } from '../../service/SavingAccountAmountService';
import { SavingAccountHistoryService } from '../../service/SavingAccountHistoryService';
import { SavingAccountService } from '../../service/SavingAccountService';
import { AccountBookDataLoader } from '../dataloader/AccountBookDataLoader';
import { FlowRecordDataLoader } from '../dataloader/FlowRecordDataLoader';
import { SavingAccountAmountDataLoader } from '../dataloader/SavingAccountAmountDataLoader';
import { UserDataLoader } from '../dataloader/UserDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import {
  CreateSavingAccountInput,
  Pagination,
  UpdateSavingAccountInput,
} from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, encodeId, EntityName } from '../utils';

@Resolver('SavingAccount')
export class SavingAccountResolver {
  constructor(
    private readonly savingAccountService: SavingAccountService,
    private readonly savingAccountHistoryService: SavingAccountHistoryService,
    private readonly savingAccountMoneyDataLoader: SavingAccountAmountDataLoader,
    private readonly userDataLoader: UserDataLoader,
    private readonly accountBookDataLoader: AccountBookDataLoader,
    private readonly flowRecordDataLoader: FlowRecordDataLoader,
    private readonly flowRecordService: FlowRecordService,
  ) {}

  @ResolveField()
  async amount(@Parent() parent: GraphqlEntity<SavingAccountEntity>) {
    const money = await this.savingAccountMoneyDataLoader.load(parent.id);

    if (money) {
      return money.amount;
    }

    return parent.initialAmount;
  }

  @ResolveField()
  async accountBook(@Parent() parent: GraphqlEntity<SavingAccountEntity>) {
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
  async creator(@Parent() parent: GraphqlEntity<SavingAccountEntity>) {
    const creatorId = encodeId(EntityName.USER, parent.creatorId);

    const creator =
      parent.creator || (await this.userDataLoader.load(creatorId));

    return creator ? { ...creator, id: creatorId } : null;
  }

  @ResolveField()
  async updater(@Parent() parent: GraphqlEntity<SavingAccountEntity>) {
    const updaterId = encodeId(EntityName.USER, parent.updaterId);

    const updater =
      parent.updater || (await this.userDataLoader.load(updaterId));

    return updater ? { ...updater, id: updaterId } : null;
  }

  @ResolveField()
  async getHistoriesByDate(
    @Parent() parent: GraphqlEntity<SavingAccountEntity>,
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
  ) {
    const histories =
      await this.savingAccountHistoryService.findBySavingAccountIdAndDealAtBetween(
        decodeId(EntityName.SAVING_ACCOUNT, parent.id),
        startDate,
        endDate,
      );

    return histories.map((it) => ({
      ...it,
      id: encodeId(EntityName.SAVING_ACCOUNT_HISTORY, it.id),
    }));
  }

  @ResolveField()
  async flowRecords(
    @Parent() parent: GraphqlEntity<SavingAccountEntity>,
    @Args('pagination') pagination?: Pagination,
  ) {
    const { total, data } =
      await this.flowRecordService.findAllBySavingAccountIdAndPagination(
        decodeId(EntityName.SAVING_ACCOUNT, parent.id),
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
  async createSavingAccount(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('savingAccount') savingsInput: CreateSavingAccountInput,
  ) {
    const { accountBookId, ...others } = savingsInput;

    const entity = await this.savingAccountService.create(
      {
        ...others,
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
    const entity = await this.savingAccountService.update(
      decodeId(EntityName.SAVING_ACCOUNT, savingsInput.id),
      savingsInput,
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
