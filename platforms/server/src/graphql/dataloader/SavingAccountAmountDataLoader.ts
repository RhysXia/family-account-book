import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { SavingAccountAmountView } from '../../entity/SavingAccountAmountView';
import { SavingAccountAmountService } from '../../service/SavingAccountAmountService';
import { decodeId, EntityName } from '../utils';

/**
 * 账户最新交易记录
 */
@Injectable({ scope: Scope.REQUEST })
export class SavingAccountAmountDataLoader extends DataLoader<
  string,
  SavingAccountAmountView
> {
  constructor(savingAccountAmountService: SavingAccountAmountService) {
    super(async (ids) => {
      const idValues = ids.map((it) => decodeId(EntityName.SAVING_ACCOUNT, it));

      const list = await savingAccountAmountService.findBySavingAccountIds(
        idValues,
      );

      return list;
    });
  }
}
