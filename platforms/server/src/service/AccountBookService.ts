import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { UserEntity } from '../entity/UserEntity';

@Injectable()
export class AccountBookService {
  constructor(private readonly dataSource: DataSource) {}

  async findAllByUser(user: UserEntity) {
    return await this.dataSource.manager.find(AccountBookEntity, {
      where: [
        {
          admins: {
            id: In([user.id]),
          },
        },
        {
          members: {
            id: user.id,
          },
        },
      ],
      order: {
        updatedAt: 'DESC',
      },
    });
  }
}
