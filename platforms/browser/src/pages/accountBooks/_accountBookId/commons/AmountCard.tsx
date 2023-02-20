import { activeAccountBookAtom } from '@/store';
import { useAtom } from 'jotai';
import { FC, useMemo } from 'react';
import dayjs, { ManipulateType } from 'dayjs';
import IndicatorCard from '@/components/IndicatorCard';
import Indicator from '@/components/Indicator';
import { Category, CategoryType, DateGroupBy } from '@/types';
import {
  useGetFlowRecordTotalAmountByAccountBookId,
  useGetFlowRecordTotalAmountPerTraderByAccountBookId,
} from '@/graphql/accountBookStatistics';
import { DATE_GROUP_BY_MAP } from '@/utils/constants';

export type AmountCardProps = {
  groupBy: DateGroupBy;
  category?: Category;
};

const AmountCard: FC<AmountCardProps> = ({ category, groupBy }) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const unit = groupBy.toLowerCase() as ManipulateType;

  const dateRange = useMemo(() => {
    const startDealAt = dayjs().startOf(unit);
    const endDealAt = startDealAt.add(1, unit);

    return [startDealAt, endDealAt];
  }, [unit]);

  const lastDateRange = useMemo(() => {
    const endDealAt = dateRange[0];
    const startDealAt = dayjs().subtract(1, unit);

    return [startDealAt, endDealAt];
  }, [dateRange, unit]);

  const { data: currentMonthData } = useGetFlowRecordTotalAmountByAccountBookId(
    {
      accountBookId: activeAccountBook!.id,
      filter: {
        categoryId: category?.id,
        startDealAt: dateRange[0].toISOString(),
        endDealAt: dateRange[1].toISOString(),
      },
    },
  );

  const { data: lastMonthData } = useGetFlowRecordTotalAmountByAccountBookId({
    accountBookId: activeAccountBook!.id,
    filter: {
      categoryId: category?.id,
      startDealAt: lastDateRange[0].toISOString(),
      endDealAt: lastDateRange[1].toISOString(),
    },
  });

  const { data: totalAmountPerTraderData } =
    useGetFlowRecordTotalAmountPerTraderByAccountBookId({
      accountBookId: activeAccountBook!.id,
      filter: {
        categoryId: category?.id,
        startDealAt: dateRange?.[0]?.toISOString(),
        endDealAt: dateRange?.[1]?.toISOString(),
      },
    });

  let currentMonthAmount = currentMonthData || 0;

  let lastMonthAmount = lastMonthData || 0;

  if (category?.type === CategoryType.EXPENDITURE) {
    if (currentMonthAmount) {
      currentMonthAmount *= -1;
    }

    if (lastMonthAmount) {
      lastMonthAmount *= -1;
    }
  }

  const userDetails = (
    <div className="flex items-center space-x-2 h-8 w-full overflow-x-auto whitespace-nowrap">
      {[...(totalAmountPerTraderData || [])]
        .sort((a, b) => (a.trader.nickname > b.trader.nickname ? 1 : -1))
        .map((it) => (
          <div key={it.trader.id} className="pr-4">
            <span className="inline-block h-full pr-2">
              {it.trader.nickname}
            </span>
            <span className="inline-block h-full">
              {(!category || category.type === CategoryType.UNKNOWN
                ? it.amount
                : Math.abs(it.amount)
              ).toLocaleString('zh-CN', {
                style: 'currency',
                currency: 'CNY',
              })}
            </span>
          </div>
        ))}
    </div>
  );

  const name = category?.name || '净收入';

  const tips = `统计${
    groupBy === 'DAY'
      ? '今天'
      : `${dayjs(dateRange[0]).format('YYYY-MM-DD')}至${dayjs(
          dateRange[1].subtract(1, 'day'),
        ).format('YYYY-MM-DD')}`
  }`;

  return (
    <IndicatorCard
      title={name}
      tips={tips}
      value={currentMonthAmount}
      footer={userDetails}
    >
      <Indicator
        title={`同比上${DATE_GROUP_BY_MAP[groupBy]}`}
        value={currentMonthAmount - lastMonthAmount}
      />
    </IndicatorCard>
  );
};

export default AmountCard;
