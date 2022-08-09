import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AccountBookEntity } from '../../entity/AccountBookEntity';
import { UserEntity } from '../../entity/UserEntity';
import { AccountBookService } from '../../service/AccountBookService';
import { UserDataLoader } from '../dataloader/UserDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import {
  AccountBook,
  CreateAccountBookInput,
  UpdateAccountBookInput,
} from '../graphql';

@Resolver('AccountBook')
export class AccountBookResolver {
  constructor(
    private readonly accountBookService: AccountBookService,
    private readonly userDataLoader: UserDataLoader,
  ) {}

  @ResolveField()
  async admins(@Parent() accountBook: AccountBook) {
    if (accountBook.admins) {
      return accountBook.admins;
    }
    return this.accountBookService.findAdminsByAccountBookId(accountBook.id);
  }

  @ResolveField()
  async members(@Parent() accountBook: AccountBookEntity) {
    if (accountBook.members) {
      return accountBook.members;
    }

    return this.accountBookService.findMembersByAccountBookId(accountBook.id);
  }

  @ResolveField()
  async creator(@Parent() accountBook: AccountBookEntity) {
    if (accountBook.creator) {
      return accountBook.creator;
    }
    return this.userDataLoader.load(accountBook.creatorId);
  }

  @ResolveField()
  async updater(@Parent() accountBook: AccountBookEntity) {
    if (accountBook.updater) {
      return accountBook.updater;
    }
    return this.userDataLoader.load(accountBook.updaterId);
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
  async getAccountBookList(@CurrentUser() user: UserEntity) {
    return this.accountBookService.findAllByUser(user);
  }

  @Query()
  async getAccountBookById(
    @CurrentUser() user: UserEntity,
    @Args('id') id: number,
  ) {
    return this.accountBookService.findByIdAndUser(id, user);
  }
}
