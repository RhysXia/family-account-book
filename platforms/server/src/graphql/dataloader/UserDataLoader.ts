import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { UserEntity } from '../../entity/UserEntity';
import { UserService } from '../../service/UserService';

@Injectable()
export class UserDataLoader extends DataLoader<number, UserEntity> {
  constructor(userService: UserService) {
    super((ids) => userService.findAllByIds([...ids]));
  }
}
