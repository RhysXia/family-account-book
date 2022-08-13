import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserEntity } from '../../entity/UserEntity';
import { SavingAccountTransferRecordService } from '../../service/SavingAccountTransferRecordService';
import CurrentUser from '../decorator/CurrentUser';
import {
  CreateSavingAccountTransferRecord,
  UpdateSavingAccountTransferRecord,
} from '../graphql';

@Resolver('SavingAccountTransferRecord')
export class SavingAccountTransferRecordResolver {
  constructor(
    private readonly savingAccountTransferRecordService: SavingAccountTransferRecordService,
  ) {}

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
}
