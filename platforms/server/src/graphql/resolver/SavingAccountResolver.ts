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
import { SavingAccountService } from '../../service/SavingAccountService';
import { AccountBookDataLoader } from '../dataloader/AccountBookDataLoader';
import { SavingAccountMoneyDataLoader } from '../dataloader/SavingAccountAmountDataLoader';
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
    private readonly savingAccountMoneyDataLoader: SavingAccountMoneyDataLoader,
    private readonly userDataLoader: UserDataLoader,
    private readonly accountBookDataLoader: AccountBookDataLoader,
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
  async getAmountHistoriesByDate(
    @Parent() parent: SavingAccountEntity,
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
  ) {
    return this.savingAccountMoneyDataLoader.findAllBySavingAccountIdAndDateBetween(
      parent.id,
      startDate,
      endDate,
    );
  }

  @Mutation()
  async createSavingAccount(
    @Args('savingAccount') savingsInput: CreateSavingAccountInput,
    @CurrentUser({ required: true }) user: UserEntity,
  ) {
    return this.savingAccountService.create(savingsInput, user);
  }

  @Mutation()
  async updateSavingAccount(
    @Args('savingAccount') savingsInput: UpdateSavingAccountInput,
    @CurrentUser({ required: true }) user: UserEntity,
  ) {
    return this.savingAccountService.update(savingsInput, user);
  }

  @Query()
  async getSelfSavingAccounts(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('pagination') pagination?: Pagination,
  ) {
    return this.savingAccountService.findAllByUserIdAndPagination(
      user.id,
      pagination,
    );
  }

  @Query()
  async getSelfSavingAccount(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('id') id: number,
  ) {
    return this.savingAccountService.findOneByIdAndUserId(id, user.id);
  }
}
