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
import { AccountBookDataLoader } from '../dataloader/AccountBookDataLoader';
import { SavingAccountTransferRecordDataLoader } from '../dataloader/SavingAccountTransferRecordDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import {
  CreateSavingAccountTransferRecord,
  UpdateSavingAccountTransferRecord,
} from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, encodeId, EntityName } from '../utils';

@Resolver('SavingAccountTransferRecord')
export class SavingAccountTransferRecordResolver {
  constructor(
    private readonly savingAccountTransferRecordService: SavingAccountTransferRecordService,
    private readonly accountBookDataLoader: AccountBookDataLoader,
    private readonly savingAccountTransferRecordDataLoader: SavingAccountTransferRecordDataLoader,
  ) {}

  @ResolveField()
  async accountBook(
    @Parent() parent: GraphqlEntity<SavingAccountTransferRecordEntity>,
  ) {
    const accountBookId = encodeId(
      EntityName.ACCOUNT_BOOK,
      parent.accountBookId,
    );

    const accountBook =
      parent.accountBook ||
      (await this.accountBookDataLoader.load(accountBookId));

    return accountBook ? { ...accountBook, id: accountBookId } : null;
  }

  @Mutation()
  async createSavingAccountTransferRecord(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('record') record: CreateSavingAccountTransferRecord,
  ) {
    const entity = await this.savingAccountTransferRecordService.create(
      record,
      currentUser,
    );

    return {
      ...entity,
      id: encodeId(EntityName.SAVING_ACCOUNT_TRANSFER_RECORD, entity.id),
    };
  }

  @Mutation()
  async updateSavingAccountTransferRecord(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('record') record: UpdateSavingAccountTransferRecord,
  ) {
    const entity = await this.savingAccountTransferRecordService.update(
      decodeId(EntityName.SAVING_ACCOUNT_TRANSFER_RECORD, record.id),
      record,
      currentUser,
    );

    return {
      ...entity,
      id: record.id,
    };
  }

  @Mutation()
  async deleteSavingAccountTransferRecord(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('id') id: string,
  ) {
    await this.savingAccountTransferRecordService.delete(
      decodeId(EntityName.SAVING_ACCOUNT_TRANSFER_RECORD, id),
      currentUser,
    );
    return true;
  }
}
