import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { SavingAccountAmountView } from '../../entity/SavingAccountAmountView';
import { SavingAccountAmountService } from '../../service/SavingAccountAmountService';

/**
 * 账户最新交易记录
 */
@Injectable({ scope: Scope.REQUEST })
export class SavingAccountAmountDataLoader extends DataLoader<
  number,
  SavingAccountAmountView | undefined
> {
  constructor(savingAccountAmountService: SavingAccountAmountService) {
    super(async (savingAccountIds) => {
      const list = await savingAccountAmountService.findBySavingAccountIds(
        savingAccountIds as Array<number>,
      );

      return savingAccountIds.map((savingAccountId) =>
        list.find((it) => it.savingAccountId === savingAccountId),
      );
    });
  }
}
