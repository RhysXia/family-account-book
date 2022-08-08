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
    private readonly useDataLoader: UserDataLoader,
  ) {}

  @ResolveField()
  async admins(@Parent() accountBook: AccountBook) {
    const ids = await this.accountBookService.findAdminIdsByAccountBookId(
      accountBook.id,
    );

    return this.useDataLoader.loadMany(ids);
  }

  @ResolveField()
  async members(@Parent() accountBook: AccountBook) {
    const ids = await this.accountBookService.findMemberIdsByAccountBookId(
      accountBook.id,
    );
    return this.useDataLoader.loadMany(ids);
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
