import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserEntity } from '../../entity/UserEntity';
import { SavingsService } from '../../service/SavingsService';
import CurrentUser from '../decorator/CurrentUser';
import { CreateSavingsInput } from '../graphql';

@Resolver('Savings')
export class SavingsResolver {
  constructor(private readonly savingsService: SavingsService) {}

  @Query()
  async getSavingsByAccountBookId(
    @Args('accountBookId') accountBookId: number,
    @CurrentUser({ required: true }) user: UserEntity,
  ) {
    return this.savingsService.findAllByAccountBookIdAndAccountBookUser(
      accountBookId,
      user,
    );
  }

  @Mutation()
  async createSavings(
    @Args('savings') savingsInput: CreateSavingsInput,
    @CurrentUser({ required: true }) user: UserEntity,
  ) {
    return this.savingsService.create(savingsInput, user);
  }
}
