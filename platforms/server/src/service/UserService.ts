import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { PasswordUtil } from '../common/PasswordUtil';
import { UserEntity } from '../entity/UserEntity';
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
  findAllByNameLike(
    name: string,
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
    const qb = this.dataSource.manager
      .createQueryBuilder(UserEntity, 'user')
      .where('(user.username like :name OR user.nickname like :name)', {
        name: `%${name}%`,
      });

    if (includeSelf) {
      if (!currentUser) {
        throw new ParameterException('当前用户不存在');
      }
    } else if (currentUser) {
      qb.andWhere('user.id != :id', { id: currentUser.id });
    }

    return qb.limit(limit).getMany();
  }

  async signIn(signInUser: {
    username: string;
    password: string;
  }): Promise<UserEntity> {
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

  async signUp(signUpUser: {
    username: string;
    password: string;
    email?: string;
    nickname: string;
    avatar?: string;
  }): Promise<UserEntity> {
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
      user.nickname = signUpUser.nickname;

      const savedUser = await manager.save(user);

      return savedUser;
    });
  }
}
