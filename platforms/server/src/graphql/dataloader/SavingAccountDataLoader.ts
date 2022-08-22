import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { SavingAccountEntity } from '../../entity/SavingAccountEntity';
import { SavingAccountService } from '../../service/SavingAccountService';
import { GraphqlEntity } from '../types';
import { decodeId, EntityName } from '../utils';

@Injectable({ scope: Scope.REQUEST })
export class SavingAccountDataLoader extends DataLoader<
  string,
  GraphqlEntity<SavingAccountEntity>
> {
  constructor(savingAccountService: SavingAccountService) {
    super(async (ids) => {
      const idValues = ids.map((it) => decodeId(EntityName.SAVING_ACCOUNT, it));

      const list = await savingAccountService.findAllByIds(idValues);
      return idValues.map((id, index) => {
        const entity = list.find((it) => it.id === id);
        if (entity) {
          return { ...entity, id: ids[index] };
        }
      });
    });
  }
}
