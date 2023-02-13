import { activeAccountBookAtom } from '@/store';
import { useAtom } from 'jotai';
import { FC } from 'react';
import { Dayjs } from 'dayjs';
import IndicatorCard from '@/components/IndicatorCard';
import Indicator from '@/components/Indicator';
import { Category, DateGroupBy } from '@/types';
import {
  useGetFlowRecordTotalAmountByAccountBookId,
  useGetFlowRecordTotalAmountPerTraderByAccountBookId,
} from '@/graphql/accountBookStatistics';

export type AmountCardProps = {
  category?: Category;
  dateRange?: [Dayjs | null, Dayjs | null] | null;
  groupBy: DateGroupBy;
};

const groupByText: Record<DateGroupBy, string> = {
  DAY: '日',
  MONTH: '月',
  YEAR: '年',
};

const AmountCard: FC<AmountCardProps> = ({ category, dateRange, groupBy }) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const { data: currentMonthData } = useGetFlowRecordTotalAmountByAccountBookId(
    {
      accountBookId: activeAccountBook!.id,
      filter: {
        categoryId: category?.id,
        startDate: dateRange?.[0]?.toISOString(),
        endDate: dateRange?.[1]?.toISOString(),
      },
    },
  );

  const { data: lastMonthData } = useGetFlowRecordTotalAmountByAccountBookId({
    accountBookId: activeAccountBook!.id,
    filter: {
      categoryId: category?.id,
      startDate: dateRange?.[0]?.toISOString(),
      endDate: dateRange?.[1]?.toISOString(),
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

  const text = groupByText[groupBy];

  return (
    <IndicatorCard
      title={name}
      tips={`${text}度${name}统计`}
      value={currentMonthAmount}
      footer={userDetails}
    >
      <Indicator
        title={`同比上${text}`}
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
