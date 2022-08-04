import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AccountBookEntity } from '../entity/AccountBookEntity';
import { UserEntity } from '../entity/UserEntity';

@Injectable()
export class AccountBookService {
  constructor(private readonly dataSource: DataSource) {}

  async findAllByUser(user: UserEntity) {
    return await this.dataSource.manager
      .createQueryBuilder(AccountBookEntity, 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('admin.id = :id', { id: user.id })
      .orWhere('member.id = :id', { id: user.id })
      .getMany();
  }
}
