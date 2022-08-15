import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { SavingAccountEntity } from '../../entity/SavingAccountEntity';
import { UserEntity } from '../../entity/UserEntity';
import { FlowRecordService } from '../../service/FlowRecordService';
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

@Resolver('SavingAccount')
export class SavingAccountResolver {
  constructor(
    private readonly savingAccountService: SavingAccountService,
    private readonly savingAccountMoneyDataLoader: SavingAccountAmountDataLoader,
    private readonly userDataLoader: UserDataLoader,
    private readonly accountBookDataLoader: AccountBookDataLoader,
    private readonly flowRecordDataLoader: FlowRecordDataLoader,
    private readonly flowRecordService: FlowRecordService,
  ) {}

  @ResolveField()
  async amount(@Parent() parent: SavingAccountEntity) {
    const money = await this.savingAccountMoneyDataLoader.load(parent.id);

    if (money) {
      return money.amount;
    }

    return parent.initialAmount;
  }

  @ResolveField()
  async accountBook(@Parent() parent: SavingAccountEntity) {
    if (parent.accountBook) {
      return parent.accountBook;
    }
    return this.accountBookDataLoader.load(parent.accountBookId);
  }

  @ResolveField()
  async creator(@Parent() parent: SavingAccountEntity) {
    if (parent.creator) {
      return parent.creator;
    }
    return this.userDataLoader.load(parent.creatorId);
  }

  @ResolveField()
  async updater(@Parent() parent: SavingAccountEntity) {
    if (parent.updater) {
      return parent.updater;
    }
    return this.userDataLoader.load(parent.updaterId);
  }

  @ResolveField()
  async getHistoriesByDate(
    @Parent() parent: SavingAccountEntity,
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
  ) {
    return this.savingAccountService.findHistoriesBySavingAccountIdAndDealAtBetween(
      parent.id,
      startDate,
      endDate,
    );
  }

  @ResolveField()
  async flowRecords(
    @Parent() parent: SavingAccountEntity,
    @Args('pagination') pagination?: Pagination,
  ) {
    return this.flowRecordService.findAllBySavingAccountIdAndPagination(
      parent.id,
      pagination,
    );
  }

  @ResolveField()
  async flowRecord(
    @Parent() parent: SavingAccountEntity,
    @Args('id') id: number,
  ) {
    const flowRecord = await this.flowRecordDataLoader.load(id);
    if (!flowRecord) {
      throw new Error('流水不存在');
    }
    if (flowRecord.savingAccountId !== parent.id) {
      throw new Error('流水不属于该储蓄账户');
    }
    return flowRecord;
  }

  @Mutation()
  async createSavingAccount(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('savingAccount') savingsInput: CreateSavingAccountInput,
  ) {
    return this.savingAccountService.create(savingsInput, user);
  }

  @Mutation()
  async updateSavingAccount(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('savingAccount') savingsInput: UpdateSavingAccountInput,
  ) {
    return this.savingAccountService.update(savingsInput, user);
  }

  @Query()
  async getAuthSavingAccounts(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('pagination') pagination?: Pagination,
  ) {
    return this.savingAccountService.findAllByUserIdAndPagination(
      user.id,
      pagination,
    );
  }

  @Query()
  async getAuthSavingAccount(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('id') id: number,
  ) {
    return this.savingAccountService.findOneByIdAndUserId(id, user.id);
  }

  @Mutation()
  async deleteSavingAccount(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('id') id: number,
  ) {
    await this.savingAccountService.delete(id, currentUser);
    return true;
  }
}