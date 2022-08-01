import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserEntity } from '../../entity/UserEntity';
import { UserService } from '../../service/UserService';
import { SESSION_CURRENT_USER } from '../../utils/constants';
import CurrentUser from '../decorator/CurrentUser';
import Session from '../decorator/Session';
import { SignUpUserInput, SignInUserInput, User } from '../graphql';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query()
  async currentUser(
    @CurrentUser({ required: true }) user: UserEntity,
  ): Promise<User> {
    return user;
  }

  @Mutation()
  async signIn(
    @Session() session: Record<string, any>,
    @Args('user') user: SignInUserInput,
  ): Promise<User> {
    const currentUser = await this.userService.signIn(user);

    session[SESSION_CURRENT_USER] = currentUser;

    return currentUser;
  }

  @Mutation()
  async signUp(@Args('user') signUpUser: SignUpUserInput): Promise<User> {
    return this.userService.signUp(signUpUser);
  }
}
