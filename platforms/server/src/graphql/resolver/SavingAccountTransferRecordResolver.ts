import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { SavingAccountTransferRecordEntity } from '../../entity/SavingAccountTransferRecordEntity';
import { UserEntity } from '../../entity/UserEntity';
import { SavingAccountTransferRecordService } from '../../service/SavingAccountTransferRecordService';
import { SavingAccountTransferRecordDataLoader } from '../dataloader/SavingAccountTransferRecordDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import {
  CreateSavingAccountTransferRecord,
  UpdateSavingAccountTransferRecord,
} from '../graphql';

@Resolver('SavingAccountTransferRecord')
export class SavingAccountTransferRecordResolver {
  constructor(
    private readonly savingAccountTransferRecordService: SavingAccountTransferRecordService,
    private readonly savingAccountTransferRecordDataLoader: SavingAccountTransferRecordDataLoader,
  ) {}

  @ResolveField()
  async accountBook(@Parent() parent: SavingAccountTransferRecordEntity) {
    if (parent.accountBook) {
      return parent.accountBook;
    }
    return this.savingAccountTransferRecordDataLoader.load(
      parent.accountBookId,
    );
  }

  @Mutation()
  async createSavingAccountTransferRecord(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('record') record: CreateSavingAccountTransferRecord,
  ) {
    return this.savingAccountTransferRecordService.create(record, currentUser);
  }

  @Mutation()
  async updateSavingAccountTransferRecord(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('record') record: UpdateSavingAccountTransferRecord,
  ) {
    this.savingAccountTransferRecordService.update(record, currentUser);
  }

  @Mutation()
  async deleteSavingAccountTransferRecord(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('id') id: number,
  ) {
    await this.savingAccountTransferRecordService.delete(id, currentUser);
    return true;
  }
}
