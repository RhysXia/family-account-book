import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { SavingAccountMoneyViewEntity } from '../../entity/SavingAccountMoneyViewEntity';
import { SavingAccountMoneyService } from '../../service/SavingAccountBalanceService';

/**
 * 账户最新交易记录
 */
@Injectable({ scope: Scope.REQUEST })
export class SavingAccountMoneyDataLoader extends DataLoader<
  number,
  SavingAccountMoneyViewEntity
> {
  constructor(savingAccountMoneyService: SavingAccountMoneyService) {
    super(async (savingAccountIds) => {
      const list =
        await savingAccountMoneyService.findAllNewestBySavingAccountIds([
          ...savingAccountIds,
        ]);
      return savingAccountIds.map((id) =>
        list.find((it) => it.savingAccountId === id),
      );
    });
  }
}
