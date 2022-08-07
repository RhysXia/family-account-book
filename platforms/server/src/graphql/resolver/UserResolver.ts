import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Session as SessionType } from 'express-session';
import { UserEntity } from '../../entity/UserEntity';
import { UserService } from '../../service/UserService';
import { SESSION_CURRENT_USER } from '../../utils/constants';
import CurrentUser from '../decorator/CurrentUser';
import Session from '../decorator/Session';
import { SignUpUserInput, SignInUserInput, User, Pagination } from '../graphql';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query()
  async getCurrentUser(
    @CurrentUser({ required: true }) user: UserEntity,
  ): Promise<User> {
    return user;
  }

  @Query()
  async searchUsers(
    @Args('username') username: string,
    @Args('limit') limit: number,
  ) {
    return this.userService.findByUsernameLike(username, limit);
  }

  @Mutation()
  async signIn(
    @Session() session: SessionType,
    @Args('user') user: SignInUserInput,
  ): Promise<User> {
    const currentUser = await this.userService.signIn(user);

    session[SESSION_CURRENT_USER] = currentUser;

    if (user.rememberMe) {
      session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
    }

    return currentUser;
  }

  @Mutation()
  async signUp(@Args('user') signUpUser: SignUpUserInput): Promise<User> {
    return this.userService.signUp(signUpUser);
  }
}
