import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { SavingAccountEntity } from '../../entity/SavingAccountEntity';
import { SavingAccountService } from '../../service/SavingAccountService';

@Injectable({ scope: Scope.REQUEST })
export class SavingAccountDataLoader extends DataLoader<
  number,
  SavingAccountEntity | undefined
> {
  constructor(savingAccountService: SavingAccountService) {
    super(async (ids) => {
      const list = await savingAccountService.findAllByIds(
        ids as Array<number>,
      );
      return ids.map((id) => list.find((it) => it.id === id));
    });
  }
}
