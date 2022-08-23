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
  SavingAccountAmountView
> {
  constructor(savingAccountAmountService: SavingAccountAmountService) {
    super(async (ids) => {
      const list = await savingAccountAmountService.findBySavingAccountIds(
        ids as Array<number>,
      );

      return ids.map((id) => list.find((it) => it.id === id));
    });
  }
}
