import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { SavingAccountAmountView } from '../../entity/SavingAccountAmountView';
import { SavingAccountService } from '../../service/SavingAccountService';
import { GraphqlEntity } from '../types';
import { decodeId, EntityName } from '../utils';

/**
 * 账户最新交易记录
 */
@Injectable({ scope: Scope.REQUEST })
export class SavingAccountAmountDataLoader extends DataLoader<
  string,
  GraphqlEntity<SavingAccountAmountView>
> {
  constructor(savingAccountService: SavingAccountService) {
    super(async (ids) => {
      const idValues = ids.map((it) =>
        decodeId(EntityName.SAVING_ACCOUNT_AMOUNT, it),
      );

      const list =
        await savingAccountService.findNewestAmountsBySavingAccountIds(
          idValues,
        );

      return idValues.map((id, index) => {
        const entity = list.find((it) => it.id === id);
        if (entity) {
          return { ...entity, id: ids[index] };
        }
      });
    });
  }
}
