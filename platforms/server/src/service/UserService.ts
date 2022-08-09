import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { PasswordUtil } from '../common/PasswordUtil';
import { UserEntity } from '../entity/UserEntity';
import { SignUpUserInput, SignInUserInput } from '../graphql/graphql';
import { omit } from '../utils/omit';
import { Like } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private readonly passwordUtil: PasswordUtil,
    private readonly dataSource: DataSource,
  ) {}

  async findAllByIds(ids: Array<number>): Promise<Array<UserEntity>> {
    return await this.dataSource.manager.find(UserEntity, {
      where: {
        id: In(ids),
      },
    });
  }

  /**
   * 根据用户名模糊查询用户列表
   * @param username
   * @param limit
   */
  findAllByUsernameLike(
    username: string,
    limit: number,
  ): Promise<Array<Omit<UserEntity, 'password'>>> {
    return this.dataSource.manager.find(UserEntity, {
      select: {
        password: false,
      },
      where: {
        username: Like(`%${username}%`),
      },
      take: limit,
    });
  }

  async signIn(
    signInUser: SignInUserInput,
  ): Promise<Omit<UserEntity, 'password'>> {
    const user = await this.dataSource.manager.findOne(UserEntity, {
      where: {
        username: signInUser.username,
      },
    });
    if (!user) {
      throw new Error('登录失败');
    }

    if (!this.passwordUtil.match(signInUser.password, user.password)) {
      throw new Error('登录失败');
    }

    return omit(user, 'password');
  }

  async signUp(
    signUpUser: SignUpUserInput,
  ): Promise<Omit<UserEntity, 'password'>> {
    return this.dataSource.transaction(async (manager) => {
      const oldUser = await manager.findOne(UserEntity, {
        where: { username: signUpUser.username },
      });

      if (oldUser) {
        throw new Error('用户已存在');
      }

      const user = new UserEntity();
      user.username = signUpUser.username;
      user.password = this.passwordUtil.encode(signUpUser.password);
      user.email = signUpUser.email;

      const savedUser = await manager.save(user);

      return omit(savedUser, 'password');
    });
  }
}
