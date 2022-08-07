import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UserEntity } from '../../entity/UserEntity';
import { AccountBookService } from '../../service/AccountBookService';
import CurrentUser from '../decorator/CurrentUser';
import {
  AccountBook,
  CreateAccountBookInput,
  UpdateAccountBookInput,
} from '../graphql';

@Resolver('AccountBook')
export class AccountBookResolver {
  constructor(private readonly accountBookService: AccountBookService) {}

  @ResolveField()
  async admins(@Parent() accountBook: AccountBook) {
    return this.accountBookService.findAdminsByAccountBookId(accountBook.id);
  }

  @ResolveField()
  async members(@Parent() accountBook: AccountBook) {
    return this.accountBookService.findMembersByAccountBookId(accountBook.id);
  }

  @Mutation()
  async createAccountBook(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('accountBook') accountBookInput: CreateAccountBookInput,
  ): Promise<AccountBook> {
    return this.accountBookService.create(accountBookInput, user);
  }

  @Mutation()
  async updateAccountBook(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('accountBook') accountBookInput: UpdateAccountBookInput,
  ): Promise<AccountBook> {
    return this.accountBookService.update(accountBookInput, user);
  }

  @Query()
  async getOwnAccountBookList(@CurrentUser() user: UserEntity) {
    return this.accountBookService.findAllByUser(user);
  }

  @Query()
  async getOwnAccountBookById(
    @CurrentUser() user: UserEntity,
    @Args('id') id: number,
  ) {
    return this.accountBookService.findByUserAndId(user, id);
  }
}
