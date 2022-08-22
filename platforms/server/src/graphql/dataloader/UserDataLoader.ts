import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { UserEntity } from '../../entity/UserEntity';
import { UserService } from '../../service/UserService';
import { GraphqlEntity } from '../types';
import { decodeId, EntityName } from '../utils';

@Injectable({ scope: Scope.REQUEST })
export class UserDataLoader extends DataLoader<
  string,
  GraphqlEntity<UserEntity>
> {
  constructor(userService: UserService) {
    super(async (ids) => {
      const idValues = ids.map((it) => decodeId(EntityName.ACCOUNT_BOOK, it));

      const list = await userService.findAllByIds(idValues);

      return idValues.map((id, index) => {
        const entity = list.find((it) => it.id === id);
        if (entity) {
          return { ...entity, id: ids[index] };
        }
      });
    });
  }
}
