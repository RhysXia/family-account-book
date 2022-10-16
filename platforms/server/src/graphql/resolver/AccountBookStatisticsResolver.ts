import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { AccountBookService } from '../../service/AccountBookService';
import {
  DateGroupBy,
  FlowRecordTotalAmountFilter,
  FlowRecordTotalAmountPerTraderFilter,
} from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, encodeId, EntityName } from '../utils';
import { getUserId } from '../utils/getUserId';

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

    const { traderId, categoryId, startDate, endDate, savingAccountId } =
      filter || {};

    return this.accountBookService.findFlowRecordTotalAmountById(
      {
        ...(categoryId && {
          categoryId: decodeId(EntityName.CATEGORY, categoryId),
        }),
        ...(savingAccountId && {
          savingAccountId: decodeId(EntityName.SAVING_ACCOUNT, savingAccountId),
        }),
        ...(startDate && { startDate }),
        ...(endDate && {
          endDate,
        }),
        ...(traderId && {
          traderId: getUserId(traderId),
        }),
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

    const { categoryId, startDate, endDate, savingAccountId } = filter || {};

    const array =
      await this.accountBookService.findFlowRecordTotalAmountPerTraderById(
        {
          ...(categoryId && {
            categoryId: decodeId(EntityName.CATEGORY, categoryId),
          }),
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

    const { traderId, categoryId, startDate, endDate, savingAccountId } =
      filter || {};

    return this.accountBookService.findFlowRecordTotalAmountByIdAndGroupByDate(
      {
        ...(categoryId && {
          categoryId: decodeId(EntityName.CATEGORY, categoryId),
        }),
        ...(savingAccountId && {
          savingAccountId: decodeId(EntityName.SAVING_ACCOUNT, savingAccountId),
        }),
        ...(startDate && { startDate }),
        ...(endDate && {
          endDate,
        }),
        ...(traderId && {
          traderId: getUserId(traderId),
        }),
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

    const { categoryId, startDate, endDate, savingAccountId } = filter || {};

    const array =
      await this.accountBookService.findFlowRecordTotalAmountPerTraderByIdAndGroupByDate(
        {
          ...(categoryId && {
            categoryId: decodeId(EntityName.CATEGORY, categoryId),
          }),
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
