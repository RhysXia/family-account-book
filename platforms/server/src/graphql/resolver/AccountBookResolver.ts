import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserEntity } from '../../entity/UserEntity';
import { AccountBookService } from '../../service/AccountBookService';
import { UserService } from '../../service/UserService';
import CurrentUser from '../decorator/CurrentUser';
import { AccountBook, AccountBookInput } from '../graphql';

@Resolver('AccountBook')
export class AccountBookResolver {
  constructor(
    private readonly userService: UserService,
    private readonly accountBookService: AccountBookService,
  ) {}

  @Mutation()
  async createAccountBook(
    @CurrentUser() user: UserEntity,
    @Args('accountBook') accountBookInput: AccountBookInput,
  ): Promise<AccountBook> {
    return this.accountBookService.create(accountBookInput, user);
  }

  @Query()
  async accountBooks(@CurrentUser() user: UserEntity) {
    return this.accountBookService.findAllByUser(user);
  }

  @Query()
  async accountBook(@CurrentUser() user: UserEntity, @Args('id') id: number) {
    return this.accountBookService.findByUserAndId(user, id);
  }
}
