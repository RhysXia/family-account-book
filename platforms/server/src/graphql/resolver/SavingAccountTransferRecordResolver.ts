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
import { SavingAccountDataLoader } from '../dataloader/SavingAccountDataLoader';
import { UserDataLoader } from '../dataloader/UserDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import {
  CreateSavingAccountTransferRecord,
  UpdateSavingAccountTransferRecord,
} from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, encodeId, EntityName } from '../utils';
import { getUserId } from '../utils/getUserId';

@Resolver('SavingAccountTransferRecord')
export class SavingAccountTransferRecordResolver {
  constructor(
    private readonly savingAccountTransferRecordService: SavingAccountTransferRecordService,
    private readonly accountBookDataLoader: AccountBookDataLoader,
    private readonly savingAccountDataLoader: SavingAccountDataLoader,
    private readonly userDataLoader: UserDataLoader,
  ) {}

  @ResolveField()
  async accountBook(
    @Parent() parent: GraphqlEntity<SavingAccountTransferRecordEntity>,
  ) {
    const accountBook =
      parent.accountBook ||
      (await this.accountBookDataLoader.load(parent.accountBookId));

    return accountBook
      ? {
          ...accountBook,
          id: encodeId(EntityName.ACCOUNT_BOOK, parent.accountBookId),
        }
      : null;
  }

  @ResolveField()
  async to(@Parent() parent: GraphqlEntity<SavingAccountTransferRecordEntity>) {
    const savingAccount =
      parent.to || (await this.savingAccountDataLoader.load(parent.toId));

    return savingAccount
      ? {
          ...savingAccount,
          id: encodeId(EntityName.SAVING_ACCOUNT, parent.toId),
        }
      : null;
  }

  @ResolveField()
  async from(
    @Parent() parent: GraphqlEntity<SavingAccountTransferRecordEntity>,
  ) {
    const savingAccount =
      parent.from || (await this.savingAccountDataLoader.load(parent.fromId));

    return savingAccount
      ? {
          ...savingAccount,
          id: encodeId(EntityName.SAVING_ACCOUNT, parent.fromId),
        }
      : null;
  }

  @ResolveField()
  async trader(
    @Parent() parent: GraphqlEntity<SavingAccountTransferRecordEntity>,
  ) {
    const trader =
      parent.trader || (await this.userDataLoader.load(parent.traderId));

    return trader
      ? { ...trader, id: encodeId(EntityName.USER, parent.traderId) }
      : null;
  }

  @ResolveField()
  async creator(
    @Parent() parent: GraphqlEntity<SavingAccountTransferRecordEntity>,
  ) {
    const creator =
      parent.creator || (await this.userDataLoader.load(parent.creatorId));

    return creator
      ? { ...creator, id: encodeId(EntityName.USER, parent.creatorId) }
      : null;
  }

  @ResolveField()
  async updater(
    @Parent() parent: GraphqlEntity<SavingAccountTransferRecordEntity>,
  ) {
    const updater =
      parent.updater || (await this.userDataLoader.load(parent.updaterId));

    return updater
      ? { ...updater, id: encodeId(EntityName.USER, parent.updaterId) }
      : null;
  }

  @Mutation()
  async createSavingAccountTransferRecord(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('record') record: CreateSavingAccountTransferRecord,
  ) {
    const {
      toSavingAccountId,
      fromSavingAccountId,
      traderId,
      desc,
      ...others
    } = record;

    const entity = await this.savingAccountTransferRecordService.create(
      {
        ...others,
        ...(desc && { desc }),
        traderId: getUserId(traderId),
        toSavingAccountId: decodeId(
          EntityName.SAVING_ACCOUNT,
          toSavingAccountId,
        ),
        fromSavingAccountId: decodeId(
          EntityName.SAVING_ACCOUNT,
          fromSavingAccountId,
        ),
      },
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
    const {
      toSavingAccountId,
      fromSavingAccountId,
      traderId,
      desc,
      amount,
      dealAt,
      ...others
    } = record;

    const entity = await this.savingAccountTransferRecordService.update(
      decodeId(EntityName.SAVING_ACCOUNT_TRANSFER_RECORD, record.id),
      {
        ...others,
        ...(desc && { desc }),
        ...(amount && { amount }),
        ...(dealAt && { dealAt }),
        ...(toSavingAccountId && {
          toSavingAccountId: decodeId(
            EntityName.SAVING_ACCOUNT,
            toSavingAccountId,
          ),
        }),
        ...(fromSavingAccountId && {
          fromSavingAccountId: decodeId(
            EntityName.SAVING_ACCOUNT,
            fromSavingAccountId,
          ),
        }),
        ...(traderId && {
          traderId: getUserId(traderId),
        }),
      },
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
