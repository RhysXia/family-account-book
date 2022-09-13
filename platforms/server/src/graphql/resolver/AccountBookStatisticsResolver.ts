import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { ParameterException } from '../../exception/ServiceException';
import { AccountBookService } from '../../service/AccountBookService';
import {
  DateGroupBy,
  FlowRecordTotalAmountFilter,
  FlowRecordTotalAmountPerTraderFilter,
} from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, encodeId, EntityName, getIdInfo } from '../utils';

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
  async flowRecordTotalAmountPerTrader(
    @Parent() parent: GraphqlEntity<AccountBookStatistics>,
    @Args('filter') filter?: FlowRecordTotalAmountPerTraderFilter,
  ) {
    const accountBookId = decodeId(
      EntityName.ACCOUNT_BOOK_STATISTICS,
      parent.id,
    );

    const { tagType, startDate, endDate, savingAccountId } = filter || {};

    const array =
      await this.accountBookService.findFlowRecordTotalAmountPerTraderById(
        {
          ...(tagType && { tagType }),
          ...(savingAccountId && {
            savingAccountId: decodeId(
              EntityName.SAVING_ACCOUNT,
              savingAccountId,
            ),
          }),
          ...(startDate && { startDate }),
          ...(endDate && {
            endDate,
          }),
        },
        accountBookId,
      );

    return array.map((it) => {
      const { amount, trader } = it;
      return {
        amount,
        trader: {
          ...it.trader,
          id: encodeId(EntityName.USER, trader.id),
        },
      };
    });
  }

  @ResolveField()
  async flowRecordTotalAmountGroupByDate(
    @Parent() parent: GraphqlEntity<AccountBookStatistics>,
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

  @ResolveField()
  async flowRecordTotalAmountPerTraderGroupByDate(
    @Parent() parent: GraphqlEntity<AccountBookStatistics>,
    @Args('groupBy') groupBy: DateGroupBy,
    @Args('filter') filter?: FlowRecordTotalAmountPerTraderFilter,
  ) {
    const accountBookId = decodeId(
      EntityName.ACCOUNT_BOOK_STATISTICS,
      parent.id,
    );

    const { categ, startDate, endDate, savingAccountId } = filter || {};

    const array =
      await this.accountBookService.findFlowRecordTotalAmountPerTraderByIdAndGroupByDate(
        {
          ...(tagType && { tagType }),
          ...(savingAccountId && {
            savingAccountId: decodeId(
              EntityName.SAVING_ACCOUNT,
              savingAccountId,
            ),
          }),
          ...(startDate && { startDate }),
          ...(endDate && {
            endDate,
          }),
        },
        accountBookId,
        groupBy,
      );

    return array.map((it) => {
      const { trader, amountPerDate } = it;
      return {
        amountPerDate,
        trader: {
          ...trader,
          id: encodeId(EntityName.USER, trader.id),
        },
      };
    });
  }
}
