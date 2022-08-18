import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entity/UserEntity';
import { AccountBookService } from '../service/AccountBookService';
import { UserService } from '../service/UserService';

@Injectable()
export class GraphqlIdUtil {
  private serviceMap: Map<any, {
    encode: (id: number) => string
  }>;

  constructor(
    userService: UserService,
    accountBookService: AccountBookService,
  ) {
    this.services = [userService, accountBookService];
  }

  findByIdAndCurrentUser(idStr: string, currentUser: UserEntity) {
    for (const service of this.services) {
      const id = service.isMatch(idStr);
      if (id) {
        return service.findByIdAndCurrentUser(id, currentUser);
      }
    }
  }
}
