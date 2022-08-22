import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { AccountBookEntity } from '../../entity/AccountBookEntity';
import { AccountBookService } from '../../service/AccountBookService';
import { GraphqlEntity } from '../types';
import { decodeId, EntityName } from '../utils';

@Injectable({ scope: Scope.REQUEST })
export class AccountBookDataLoader extends DataLoader<
  string,
  GraphqlEntity<AccountBookEntity>
> {
  constructor(accountBookService: AccountBookService) {
    super(async (ids) => {
      const idValues = ids.map((it) => decodeId(EntityName.ACCOUNT_BOOK, it));

      const list = await accountBookService.findAllByIds(idValues);

      return idValues.map((id, index) => {
        const entity = list.find((it) => it.id === id);
        if (entity) {
          return { ...entity, id: ids[index] };
        }
      });
    });
  }
}
