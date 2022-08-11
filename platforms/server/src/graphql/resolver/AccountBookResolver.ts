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
import { TagService } from '../../service/TagService';
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
    private readonly tagService: TagService,
  ) {}

  @ResolveField()
  async admins(@Parent() parent: AccountBook) {
    if (parent.admins) {
      return parent.admins;
    }
    return this.accountBookService.findAdminsByAccountBookId(parent.id);
  }

  @ResolveField()
  async members(@Parent() parent: AccountBookEntity) {
    if (parent.members) {
      return parent.members;
    }

    return this.accountBookService.findMembersByAccountBookId(parent.id);
  }

  @ResolveField()
  async creator(@Parent() parent: AccountBookEntity) {
    if (parent.creator) {
      return parent.creator;
    }
    return this.userDataLoader.load(parent.creatorId);
  }

  @ResolveField()
  async updater(@Parent() parent: AccountBookEntity) {
    if (parent.updater) {
      return parent.updater;
    }
    return this.userDataLoader.load(parent.updaterId);
  }

  @ResolveField()
  async savingAccounts(
    @Parent() parent: AccountBookEntity,
    @Args('pagination') pagination?: Pagination,
  ) {
    return this.savingAccountService.findAllByAccountBookIdAndPagination(
      parent.id,
      pagination,
    );
  }

  @ResolveField()
  async savingAccount(
    @Parent() parent: AccountBookEntity,
    @Args('id') id: number,
  ) {
    return this.savingAccountService.findOneByIdAndAccountBookId(id, parent.id);
  }

  @ResolveField()
  async tags(@Parent() parent: AccountBookEntity) {
    return this.tagService.findAllByAccountBookId(parent.id);
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
