import { activeAccountBookAtom } from '@/store';
import { useAtom } from 'jotai';
import { FC, useMemo } from 'react';
import dayjs, { ManipulateType } from 'dayjs';
import IndicatorCard from '@/components/IndicatorCard';
import Indicator from '@/components/Indicator';
import { Category, DateGroupBy } from '@/types';
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
    const startDate = dayjs().startOf(unit);
    const endDate = startDate.add(1, unit);

    return [startDate, endDate];
  }, [unit]);

  const lastDateRange = useMemo(() => {
    const endDate = dateRange[0];
    const startDate = dayjs().subtract(1, unit);

    return [startDate, endDate];
  }, [dateRange, unit]);

  const { data: currentMonthData } = useGetFlowRecordTotalAmountByAccountBookId(
    {
      accountBookId: activeAccountBook!.id,
      filter: {
        categoryId: category?.id,
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
      },
    },
  );

  const { data: lastMonthData } = useGetFlowRecordTotalAmountByAccountBookId({
    accountBookId: activeAccountBook!.id,
    filter: {
      categoryId: category?.id,
      startDate: lastDateRange[0].toISOString(),
      endDate: lastDateRange[1].toISOString(),
    },
  });

  const { data: totalAmountPerTraderData } =
    useGetFlowRecordTotalAmountPerTraderByAccountBookId({
      accountBookId: activeAccountBook!.id,
      filter: {
        categoryId: category?.id,
        startDate: dateRange?.[0]?.toISOString(),
        endDate: dateRange?.[1]?.toISOString(),
      },
    });

  const currentMonthAmount = currentMonthData || 0;

  const lastMonthAmount = lastMonthData || 0;

  const userDetails = (
    <div className="flex items-center space-x-2 w-full overflow-auto h-6">
      {totalAmountPerTraderData?.map((it) => (
        <div key={it.trader.id} className="pr-4">
          <span className="pr-2">{it.trader.nickname}</span>
          <span>
            {it.amount.toLocaleString('zh-CN', {
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
        value={
          lastMonthAmount
            ? Math.abs((currentMonthAmount - lastMonthAmount) / lastMonthAmount)
            : undefined
        }
      />
    </IndicatorCard>
  );
};

export default AmountCard;
