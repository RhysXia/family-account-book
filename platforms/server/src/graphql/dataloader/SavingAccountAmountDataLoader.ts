import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { SavingAccountAmountView } from '../../entity/SavingAccountAmountView';
import { SavingAccountService } from '../../service/SavingAccountService';

/**
 * 账户最新交易记录
 */
@Injectable({ scope: Scope.REQUEST })
export class SavingAccountAmountDataLoader extends DataLoader<
  number,
  SavingAccountAmountView
> {
  constructor(savingAccountService: SavingAccountService) {
    super(async (savingAccountIds) => {
      const list =
        await savingAccountService.findNewestAmountsBySavingAccountIds([
          ...savingAccountIds,
        ]);
      return savingAccountIds.map((id) =>
        list.find((it) => it.savingAccountId === id),
      );
    });
  }
}
