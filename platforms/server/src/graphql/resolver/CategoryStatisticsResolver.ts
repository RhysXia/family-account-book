import { Resolver, ResolveField, Args, Parent } from '@nestjs/graphql';
import { FlowRecordService } from '../../service/FlowRecordService';
import { FlowRecordTotalAmountPerTagFilter } from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, EntityName, encodeId } from '../utils';
import { getUserId } from '../utils/getUserId';

export type CategoryStatistics = {
  id: string;
};

@Resolver('CategoryStatistics')
export class CategoryStatisticsResolver {
  constructor(private readonly flowRecordService: FlowRecordService) {}

  @ResolveField()
  async flowRecordTotalAmountPerTag(
    @Parent() parent: GraphqlEntity<CategoryStatistics>,
    @Args('filter') filter?: FlowRecordTotalAmountPerTagFilter,
  ) {
    const categoryId = decodeId(EntityName.CATEGORY_STATISTICS, parent.id);

    const { traderId, startDealAt, endDealAt, savingAccountId, tagId } =
      filter || {};

    const array =
      await this.flowRecordService.findFlowRecordTotalAmountPerTagByCategoryId(
        {
          ...(traderId && {
            traderId: getUserId(traderId),
          }),
          ...(savingAccountId && {
            savingAccountId: decodeId(
              EntityName.SAVING_ACCOUNT,
              savingAccountId,
            ),
          }),
          ...(tagId && {
            tagId: decodeId(EntityName.TAG, tagId),
          }),
          ...(startDealAt && { startDealAt }),
          ...(endDealAt && {
            endDealAt,
          }),
        },
        categoryId,
      );

    return array.map((it) => {
      const { amount, tag } = it;
      return {
        amount,
        tag: {
          ...it.tag,
          id: encodeId(EntityName.TAG, tag.id),
        },
      };
    });
  }

  @ResolveField()
  async flowRecordTotalAmountPerTagAndTrader(
    @Parent() parent: GraphqlEntity<CategoryStatistics>,
    @Args('filter') filter?: FlowRecordTotalAmountPerTagFilter,
  ) {
    const categoryId = decodeId(EntityName.CATEGORY_STATISTICS, parent.id);

    const { traderId, startDealAt, endDealAt, savingAccountId, tagId } =
      filter || {};

    const array =
      await this.flowRecordService.findFlowRecordTotalAmountPerTagAndTraderByCategoryId(
        {
          ...(traderId && {
            traderId: getUserId(traderId),
          }),
          ...(savingAccountId && {
            savingAccountId: decodeId(
              EntityName.SAVING_ACCOUNT,
              savingAccountId,
            ),
          }),
          ...(tagId && {
            tagId: decodeId(EntityName.TAG, tagId),
          }),
          ...(startDealAt && { startDealAt }),
          ...(endDealAt && {
            endDealAt,
          }),
        },
        categoryId,
      );

    return array.map(({ trader, data }) => {
      return {
        trader: {
          ...trader,
          id: encodeId(EntityName.USER, trader.id),
        },
        data: data.map(({ amount, tag }) => ({
          amount,
          tag: {
            ...tag,
            id: encodeId(EntityName.TAG, tag.id),
          },
        })),
      };
    });
  }
}
