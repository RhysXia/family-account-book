import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { UserEntity } from '../../entity/UserEntity';
import { UserService } from '../../service/UserService';

@Injectable({ scope: Scope.REQUEST })
export class UserDataLoader extends DataLoader<number, UserEntity | undefined> {
  constructor(userService: UserService) {
    super(async (ids) => {
      const list = await userService.findAllByIds(Array.from(new Set(ids)));

      return ids.map((id) => list.find((it) => it.id === id));
    });
  }
}
