import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { SavingAccountTransferRecordEntity } from '../../entity/SavingAccountTransferRecordEntity';
import { SavingAccountTransferRecordService } from '../../service/SavingAccountTransferRecordService';

@Injectable({ scope: Scope.REQUEST })
export class SavingAccountTransferRecordDataLoader extends DataLoader<
  number,
  SavingAccountTransferRecordEntity | undefined
> {
  constructor(
    savingAccountTransferRecordService: SavingAccountTransferRecordService,
  ) {
    super(async (ids) => {
      const list = await savingAccountTransferRecordService.findAllByIds(
        ids as Array<number>,
      );

      return ids.map((id) => list.find((it) => it.id === id));
    });
  }
}
