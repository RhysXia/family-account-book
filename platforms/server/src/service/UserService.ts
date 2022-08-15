import { Injectable } from '@nestjs/common';
import { DataSource, FindManyOptions, In, Not } from 'typeorm';
import { PasswordUtil } from '../common/PasswordUtil';
import { UserEntity } from '../entity/UserEntity';
import { SignUpUserInput, SignInUserInput } from '../graphql/graphql';
import { Like } from 'typeorm';
import {
  AuthentizationException,
  ParameterException,
} from '../exception/ServiceException';

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
    {
      limit,
      includeSelf,
      currentUser,
    }: {
      limit: number;
      includeSelf: boolean;
      currentUser: UserEntity | null;
    },
  ): Promise<Array<Omit<UserEntity, 'password'>>> {
    const where: FindManyOptions<UserEntity>['where'] = {
      username: Like(`%${username}%`),
    };

    if (includeSelf) {
      if (!currentUser) {
        throw new ParameterException('当前用户不存在');
      }
    } else {
      where.id = Not(currentUser.id);
    }

    return this.dataSource.manager.find(UserEntity, {
      where: where,
      take: limit,
    });
  }

  async signIn(signInUser: SignInUserInput): Promise<UserEntity> {
    const user = await this.dataSource.manager.findOne(UserEntity, {
      where: {
        username: signInUser.username,
      },
    });
    if (!user) {
      throw new AuthentizationException('登录失败');
    }

    if (!this.passwordUtil.match(signInUser.password, user.password)) {
      throw new AuthentizationException('登录失败');
    }

    return user;
  }

  async signUp(signUpUser: SignUpUserInput): Promise<UserEntity> {
    return this.dataSource.transaction(async (manager) => {
      const oldUser = await manager.findOne(UserEntity, {
        where: { username: signUpUser.username },
      });

      if (oldUser) {
        throw new ParameterException('用户已存在');
      }

      const user = new UserEntity();
      user.username = signUpUser.username;
      user.password = this.passwordUtil.encode(signUpUser.password);
      user.email = signUpUser.email;

      const savedUser = await manager.save(user);

      return savedUser;
    });
  }
}
