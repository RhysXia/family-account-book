import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity } from '../entity/UserEntity';

@Injectable()
export class UserService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<Array<UserEntity>> {
    const users = await this.dataSource.transaction(async (manager) => {
      return manager.find(UserEntity);
    });

    return users;
  }
}
