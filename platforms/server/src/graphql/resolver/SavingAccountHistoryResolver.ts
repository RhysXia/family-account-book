import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { SavingAccountHistoryEntity } from '../../entity/SavingAccountHistoryEntity';
import { AccountBookDataLoader } from '../dataloader/AccountBookDataLoader';
import { GraphqlEntity } from '../types';
import { encodeId, EntityName } from '../utils';

@Resolver('SavingAccountHistory')
export class SavingAccountHistoryResolver {
  constructor(private readonly accountBookDataLoader: AccountBookDataLoader) {}

  @ResolveField()
  async accountBook(
    @Parent() parent: GraphqlEntity<SavingAccountHistoryEntity>,
  ) {
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
  async savingAccount(
    @Parent() parent: GraphqlEntity<SavingAccountHistoryEntity>,
  ) {
    const savingAccount =
      parent.savingAccount ||
      (await this.accountBookDataLoader.load(parent.savingAccountId));

    return savingAccount
      ? {
          ...savingAccount,
          id: encodeId(EntityName.ACCOUNT_BOOK, parent.savingAccountId),
        }
      : null;
  }
}
