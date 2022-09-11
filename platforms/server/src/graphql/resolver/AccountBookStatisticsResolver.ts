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

    const { traderId, tagType, startDate, endDate } = filter || {};

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
    @Args('tagType') tagType: TagType,
    @Args('groupBy') groupBy: DateGroupBy,
    @Args('traderId') traderId?: string,
    @Args('startDate') startDate?: Date,
    @Args('endDate') endDate?: Date,
  ) {
    const accountBookId = decodeId(EntityName.ACCOUNT_BOOK, parent.id);

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

    return this.accountBookService.findFlowRecordAmountByIdAndGroupBy(
      { startDate, endDate, tagType, traderId: traderIdValue },
      accountBookId,
      groupBy,
    );
  }
}
