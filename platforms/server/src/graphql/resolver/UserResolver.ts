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
import { GraphqlEntity } from '../types';
import { decodeId, encodeId, EntityName } from '../utils';

@Resolver('User')
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly accountBookService: AccountBookService,
  ) {}

  @ResolveField()
  async accountBooks(
    @Parent() parent: GraphqlEntity<User>,
    @Args('pagination') pagination?: Pagination,
  ) {
    const { total, data } =
      await this.accountBookService.findAllByUserIdAndPagination(
        decodeId(EntityName.USER, parent.id),
        pagination,
      );

    return {
      total,
      data: data.map((it) => ({
        ...it,
        id: encodeId(EntityName.ACCOUNT_BOOK, it.id),
      })),
    };
  }

  @ResolveField()
  async accountBook(
    @Parent() parent: GraphqlEntity<User>,
    @Args('id') id: string,
  ) {
    const accountBooks = await this.accountBookService.findByIdsAndUserId(
      [decodeId(EntityName.ACCOUNT_BOOK, id)],
      decodeId(EntityName.USER, parent.id),
    );

    const accountBook = accountBooks[0];

    if (accountBook) {
      return {
        ...accountBook,
        id: encodeId(EntityName.ACCOUNT_BOOK, accountBook.id),
      };
    }
    return null;
  }

  @Query()
  async getCurrentUser(@CurrentUser({ required: true }) user: UserEntity) {
    return { ...user, id: encodeId(EntityName.USER, user.id) };
  }

  @Query()
  async findUserListByNameLike(
    @CurrentUser({ required: false }) currentUser: UserEntity | null,
    @Args('name') name: string,
    @Args('limit') limit: number,
    @Args('includeSelf') includeSelf: boolean,
  ) {
    const users = await this.userService.findAllByNameLike(name, {
      limit,
      includeSelf,
      currentUser,
    });

    return users.map((it) => ({
      ...it,
      id: encodeId(EntityName.SIMPLE_USER, it.id),
    }));
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

    return { ...currentUser, id: encodeId(EntityName.USER, currentUser.id) };
  }

  @Mutation()
  async signUp(@Args('user') signUpUser: SignUpUserInput) {
    const user = await this.userService.signUp(signUpUser);

    return { ...user, id: encodeId(EntityName.USER, user.id) };
  }
}
