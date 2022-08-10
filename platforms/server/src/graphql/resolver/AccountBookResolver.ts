import {
  Query,
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AccountBookEntity } from '../../entity/AccountBookEntity';
import { UserEntity } from '../../entity/UserEntity';
import { AccountBookService } from '../../service/AccountBookService';
import { SavingAccountService } from '../../service/SavingAccountService';
import { UserDataLoader } from '../dataloader/UserDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import {
  AccountBook,
  CreateAccountBookInput,
  Pagination,
  UpdateAccountBookInput,
} from '../graphql';

@Resolver('AccountBook')
export class AccountBookResolver {
  constructor(
    private readonly accountBookService: AccountBookService,
    private readonly userDataLoader: UserDataLoader,
    private readonly savingAccountService: SavingAccountService,
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

  @ResolveField()
  async savingAccounts(
    @Parent() accountBook: AccountBookEntity,
    @Args('pagination') pagination?: Pagination,
  ) {
    return this.savingAccountService.findAllByAccountBookIdAndPagination(
      accountBook.id,
      pagination,
    );
  }

  @ResolveField()
  async savingAccount(
    @Parent() accountBook: AccountBookEntity,
    @Args('id') id: number,
  ) {
    return this.savingAccountService.findOneByIdAndAccountBookId(
      id,
      accountBook.id,
    );
  }

  @Mutation()
  async createAccountBook(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('accountBook') accountBookInput: CreateAccountBookInput,
  ) {
    return this.accountBookService.create(accountBookInput, user);
  }

  @Mutation()
  async updateAccountBook(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('accountBook') accountBookInput: UpdateAccountBookInput,
  ) {
    return this.accountBookService.update(accountBookInput, user);
  }

  @Query()
  async getSelfAccountBookById(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('id') id: number,
  ) {
    return this.accountBookService.findOneByIdAndUserId(id, user.id);
  }

  @Query()
  async getSelfAccountBooks(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('pagination') pagination?: Pagination,
  ) {
    return this.accountBookService.findAllByUserIdAndPagination(
      user.id,
      pagination,
    );
  }
}
