import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { SavingAccountTransferRecordEntity } from '../../entity/SavingAccountTransferRecordEntity';
import { SavingAccountTransferRecordService } from '../../service/SavingAccountTransferRecordService';
import { GraphqlEntity } from '../types';
import { decodeId, EntityName } from '../utils';

@Injectable({ scope: Scope.REQUEST })
export class SavingAccountTransferRecordDataLoader extends DataLoader<
  string,
  GraphqlEntity<SavingAccountTransferRecordEntity>
> {
  constructor(
    savingAccountTransferRecordService: SavingAccountTransferRecordService,
  ) {
    super(async (ids) => {
      const idValues = ids.map((it) =>
        decodeId(EntityName.SAVING_ACCOUNT_TRANSFER_RECORD, it),
      );
      const list = await savingAccountTransferRecordService.findAllByIds(
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
