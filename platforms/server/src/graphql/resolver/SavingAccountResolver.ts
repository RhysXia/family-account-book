import {
  Args,
  Mutation,
  Parent,
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
import { CreateSavingAccountInput, UpdateSavingAccountInput } from '../graphql';

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
  async creator(@Parent() accountBook: SavingAccountEntity) {
    if (accountBook.creator) {
      return accountBook.creator;
    }
    return this.userDataLoader.load(accountBook.creatorId);
  }

  @ResolveField()
  async updater(@Parent() accountBook: SavingAccountEntity) {
    if (accountBook.updater) {
      return accountBook.updater;
    }
    return this.userDataLoader.load(accountBook.updaterId);
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
}
