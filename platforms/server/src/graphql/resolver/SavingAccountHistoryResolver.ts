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
  async savingAccount(
    @Parent() parent: GraphqlEntity<SavingAccountHistoryEntity>,
  ) {
    const savingAccountId = encodeId(
      EntityName.ACCOUNT_BOOK,
      parent.savingAccountId,
    );

    const savingAccount =
      parent.savingAccount ||
      (await this.accountBookDataLoader.load(savingAccountId));

    return savingAccount ? { ...savingAccount, id: savingAccountId } : null;
  }
}
