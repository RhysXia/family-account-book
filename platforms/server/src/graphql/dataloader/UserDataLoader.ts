import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { UserEntity } from '../../entity/UserEntity';
import { UserService } from '../../service/UserService';

@Injectable({ scope: Scope.REQUEST })
export class UserDataLoader extends DataLoader<number, UserEntity> {
  constructor(userService: UserService) {
    super(async (ids) => {
      const list = await userService.findAllByIds(ids as Array<number>);

      return ids.map((id) => list.find((it) => it.id === id));
    });
  }
}
