import { Injectable } from '@nestjs/common';
import { DataSource, Like, FindOptionsOrder } from 'typeorm';
import { PasswordUtil } from '../common/PasswordUtil';
import { UserEntity } from '../entity/UserEntity';
import {
  SignUpUserInput,
  SignInUserInput,
  Pagination,
} from '../graphql/graphql';

@Injectable()
export class UserService {
  constructor(
    private readonly passwordUtil: PasswordUtil,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(name: string, pagination: Pagination) {
    const order: FindOptionsOrder<UserEntity> = {};

    const orderBy = pagination.orderBy;

    orderBy.forEach((it) => {
      order[it.field] = it.direction;
    });

    return this.dataSource.manager.find(UserEntity, {
      where: {
        username: Like(`%${name}%`),
      },
      order,
      skip: pagination.skip,
      take: pagination.take,
    });
  }

  async signIn(signInUser: SignInUserInput) {
    const user = await this.dataSource.manager.findOne(UserEntity, {
      where: { username: signInUser.username },
      select: {
        password: false,
      },
    });
    if (!user) {
      throw new Error('登录失败');
    }

    if (!this.passwordUtil.match(signInUser.password, user.password)) {
      throw new Error('登录失败');
    }

    return user;
  }

  async signUp(signUpUser: SignUpUserInput) {
    return this.dataSource.transaction(async (manager) => {
      const oldUser = await manager.findOne(UserEntity, {
        where: { username: signUpUser.username },
      });

      if (oldUser) {
        throw new Error('用户已存在');
      }

      const now = new Date();

      const user = new UserEntity();
      user.username = signUpUser.username;
      user.password = this.passwordUtil.encode(signUpUser.password);
      user.nickname =
        signUpUser.nickname || now.getMilliseconds().toString().slice(-9);
      user.email = signUpUser.email;

      user.createdAt = now;
      user.updatedAt = now;

      return manager.save(user);
    });
  }
}
