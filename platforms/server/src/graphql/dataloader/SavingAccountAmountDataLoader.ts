import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { SavingAccountMoneyViewEntity } from '../../entity/SavingAccountMoneyViewEntity';
import { SavingAccountMoneyService } from '../../service/SavingAccountMoneyService';

/**
 * 账户最新交易记录
 */
@Injectable({ scope: Scope.REQUEST })
export class SavingAccountMoneyDataLoader extends DataLoader<
  number,
  SavingAccountMoneyViewEntity
> {
  findAllBySavingAccountIdAndDateBetween(
    id: number,
    startDate: Date,
    endDate: Date,
  ) {
    throw new Error('Method not implemented.');
  }
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
