import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { AccountBookEntity } from '../../entity/AccountBookEntity';
import { AccountBookService } from '../../service/AccountBookService';

@Injectable({ scope: Scope.REQUEST })
export class AccountBookDataLoader extends DataLoader<
  number,
  AccountBookEntity | undefined
> {
  constructor(accountBookService: AccountBookService) {
    super(async (ids) => {
      const list = await accountBookService.findAllByIds(ids as Array<number>);

      return ids.map((id) => list.find((it) => it.id === id));
    });
  }
}
