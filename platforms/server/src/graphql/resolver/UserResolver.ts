import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Session as SessionType } from 'express-session';
import { UserEntity } from '../../entity/UserEntity';
import { AccountBookService } from '../../service/AccountBookService';
import { UserService } from '../../service/UserService';
import { SESSION_CURRENT_USER } from '../../utils/constants';
import CurrentUser from '../decorator/CurrentUser';
import Session from '../decorator/Session';
import { SignUpUserInput, SignInUserInput, User, Pagination } from '../graphql';

@Resolver('User')
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly accountBookService: AccountBookService,
  ) {}

  @ResolveField()
  async accountBooks(
    @Parent() parent: User,
    @Args('pagination') pagination?: Pagination,
  ) {
    return this.accountBookService.findAllByUserIdAndPagination(
      parent.id,
      pagination,
    );
  }

  @ResolveField()
  async accountBook(@Parent() parent: User, @Args('id') id: number) {
    return this.accountBookService.findOneByIdAndUserId(id, parent.id);
  }

  @Query()
  async getCurrentUser(@CurrentUser({ required: true }) user: UserEntity) {
    return user;
  }

  @Query()
  async findUserListByNameLike(
    @CurrentUser({ required: false }) currentUser: UserEntity | null,
    @Args('name') name: string,
    @Args('limit') limit: number,
    @Args('includeSelf') includeSelf: boolean,
  ) {
    return this.userService.findAllByNameLike(name, {
      limit,
      includeSelf,
      currentUser,
    });
  }

  @Mutation()
  async signIn(
    @Session() session: SessionType,
    @Args('user') user: SignInUserInput,
  ) {
    const currentUser = await this.userService.signIn(user);

    session[SESSION_CURRENT_USER] = currentUser;

    if (user.rememberMe) {
      session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
    }

    return currentUser;
  }

  @Mutation()
  async signUp(@Args('user') signUpUser: SignUpUserInput) {
    return this.userService.signUp(signUpUser);
  }
}
