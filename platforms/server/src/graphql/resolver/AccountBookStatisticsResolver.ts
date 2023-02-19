import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { FlowRecordService } from '../../service/FlowRecordService';
import {
  DateGroupBy,
  FlowRecordTotalAmountFilter,
  FlowRecordTotalAmountPerCategoryFilter,
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
  constructor(private readonly flowRecordService: FlowRecordService) {}

  @ResolveField()
  async flowRecordTotalAmount(
    @Parent() parent: GraphqlEntity<AccountBookStatistics>,
    @Args('filter') filter?: FlowRecordTotalAmountFilter,
  ) {
    const accountBookId = decodeId(
      EntityName.ACCOUNT_BOOK_STATISTICS,
      parent.id,
    );

    const {
      traderId,
      categoryId,
      startDealAt,
      endDealAt,
      savingAccountId,
      categoryType,
      tagId,
    } = filter || {};

    return this.flowRecordService.findFlowRecordTotalAmountByAccountBookId(
      {
        ...(categoryType && {
          categoryType,
        }),
        ...(categoryId && {
          categoryId: decodeId(EntityName.CATEGORY, categoryId),
        }),
        ...(tagId && {
          tagId: decodeId(EntityName.TAG, tagId),
        }),
        ...(savingAccountId && {
          savingAccountId: decodeId(EntityName.SAVING_ACCOUNT, savingAccountId),
        }),
        ...(startDealAt && { startDealAt }),
        ...(endDealAt && {
          endDealAt,
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

    const {
      categoryId,
      tagId,
      startDealAt,
      endDealAt,
      savingAccountId,
      categoryType,
    } = filter || {};

    const array =
      await this.flowRecordService.findFlowRecordTotalAmountPerTraderByAccountBookId(
        {
          ...(categoryType && {
            categoryType,
          }),
          ...(categoryId && {
            categoryId: decodeId(EntityName.CATEGORY, categoryId),
          }),
          ...(tagId && {
            tagId: decodeId(EntityName.TAG, tagId),
          }),
          ...(savingAccountId && {
            savingAccountId: decodeId(
              EntityName.SAVING_ACCOUNT,
              savingAccountId,
            ),
          }),
          ...(startDealAt && { startDealAt }),
          ...(endDealAt && {
            endDealAt,
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

    const {
      traderId,
      categoryId,
      startDealAt,
      endDealAt,
      savingAccountId,
      categoryType,
      tagId,
    } = filter || {};

    return this.flowRecordService.findFlowRecordTotalAmountByAccountBookIdAndGroupByDate(
      {
        ...(categoryType && {
          categoryType,
        }),
        ...(categoryId && {
          categoryId: decodeId(EntityName.CATEGORY, categoryId),
        }),
        ...(tagId && {
          tagId: decodeId(EntityName.TAG, tagId),
        }),
        ...(savingAccountId && {
          savingAccountId: decodeId(EntityName.SAVING_ACCOUNT, savingAccountId),
        }),
        ...(startDealAt && { startDealAt }),
        ...(endDealAt && {
          endDealAt,
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

    const {
      categoryId,
      tagId,
      startDealAt,
      endDealAt,
      savingAccountId,
      categoryType,
    } = filter || {};

    const array =
      await this.flowRecordService.findFlowRecordTotalAmountPerTraderByAccountBookIdAndGroupByDate(
        {
          ...(categoryType && {
            categoryType,
          }),
          ...(categoryId && {
            categoryId: decodeId(EntityName.CATEGORY, categoryId),
          }),
          ...(tagId && {
            tagId: decodeId(EntityName.TAG, tagId),
          }),
          ...(savingAccountId && {
            savingAccountId: decodeId(
              EntityName.SAVING_ACCOUNT,
              savingAccountId,
            ),
          }),
          ...(startDealAt && { startDealAt }),
          ...(endDealAt && {
            endDealAt,
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

  @ResolveField()
  async flowRecordTotalAmountPerCategory(
    @Parent() parent: GraphqlEntity<AccountBookStatistics>,
    @Args('filter') filter?: FlowRecordTotalAmountPerCategoryFilter,
  ) {
    const accountBookId = decodeId(
      EntityName.ACCOUNT_BOOK_STATISTICS,
      parent.id,
    );

    const {
      traderId,
      tagId,
      startDealAt,
      endDealAt,
      savingAccountId,
      categoryType,
    } = filter || {};

    const array =
      await this.flowRecordService.findFlowRecordTotalAmountPerCategoryByAccountBookId(
        {
          ...(categoryType && {
            categoryType,
          }),
          ...(traderId && {
            traderId: getUserId(traderId),
          }),
          ...(tagId && {
            tagId: decodeId(EntityName.TAG, tagId),
          }),
          ...(savingAccountId && {
            savingAccountId: decodeId(
              EntityName.SAVING_ACCOUNT,
              savingAccountId,
            ),
          }),
          ...(startDealAt && { startDealAt }),
          ...(endDealAt && {
            endDealAt,
          }),
        },
        accountBookId,
      );

    return array.map((it) => {
      const { amount, category } = it;
      return {
        amount,
        category: {
          ...it.category,
          id: encodeId(EntityName.CATEGORY, category.id),
        },
      };
    });
  }
}
