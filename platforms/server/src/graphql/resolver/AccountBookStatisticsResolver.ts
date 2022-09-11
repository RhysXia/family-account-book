import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { AccountBookEntity } from '../../entity/AccountBookEntity';
import { ParameterException } from '../../exception/ServiceException';
import { AccountBookService } from '../../service/AccountBookService';
import { TagType, DateGroupBy, FlowRecordTotalAmountFilter } from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, EntityName, getIdInfo } from '../utils';

export type AccountBookStatistics = {
  id: string;
};

@Resolver('AccountBookStatistics')
export class AccountBookStatisticsResolver {
  constructor(private readonly accountBookService: AccountBookService) {}

  @ResolveField()
  async flowRecordTotalAmount(
    @Parent() parent: GraphqlEntity<AccountBookStatistics>,
    @Args('filter') filter?: FlowRecordTotalAmountFilter,
  ) {
    const accountBookId = decodeId(
      EntityName.ACCOUNT_BOOK_STATISTICS,
      parent.id,
    );

    const { traderId, tagType, startDate, endDate, savingAccountId } =
      filter || {};

    let traderIdValue: number | undefined;

    if (traderId) {
      const info = getIdInfo(traderId);
      if (
        info.name !== EntityName.DETAIL_USER &&
        info.name !== EntityName.USER
      ) {
        throw new ParameterException('userId不正确');
      }
      traderIdValue = info.id;
    }

    return this.accountBookService.findFlowRecordTotalAmountById(
      {
        ...(tagType && { tagType }),
        ...(savingAccountId && {
          savingAccountId: decodeId(EntityName.SAVING_ACCOUNT, savingAccountId),
        }),
        ...(startDate && { startDate }),
        ...(endDate && {
          endDate,
        }),
        traderId: traderIdValue,
      },
      accountBookId,
    );
  }

  @ResolveField()
  async flowRecordTotalAmountGroupByDate(
    @Parent() parent: GraphqlEntity<AccountBookEntity>,
    @Args('groupBy') groupBy: DateGroupBy,
    @Args('filter') filter?: FlowRecordTotalAmountFilter,
  ) {
    const accountBookId = decodeId(
      EntityName.ACCOUNT_BOOK_STATISTICS,
      parent.id,
    );

    const { traderId, tagType, startDate, endDate, savingAccountId } =
      filter || {};

    let traderIdValue: number | undefined;

    if (traderId) {
      const info = getIdInfo(traderId);
      if (
        info.name !== EntityName.DETAIL_USER &&
        info.name !== EntityName.USER
      ) {
        throw new ParameterException('userId不正确');
      }
      traderIdValue = info.id;
    }

    return this.accountBookService.findFlowRecordTotalAmountByIdAndGroupByDate(
      {
        ...(tagType && { tagType }),
        ...(savingAccountId && {
          savingAccountId: decodeId(EntityName.SAVING_ACCOUNT, savingAccountId),
        }),
        ...(startDate && { startDate }),
        ...(endDate && {
          endDate,
        }),
        traderId: traderIdValue,
      },
      accountBookId,
      groupBy,
    );
  }
}
