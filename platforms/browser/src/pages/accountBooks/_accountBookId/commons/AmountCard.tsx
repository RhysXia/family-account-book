import { activeAccountBookAtom } from '@/store';
import { useAtom } from 'jotai';
import { FC } from 'react';
import { Dayjs } from 'dayjs';
import IndicatorCard from '@/components/IndicatorCard';
import Indicator from '@/components/Indicator';
import { Category } from '@/types';
import {
  useGetFlowRecordTotalAmountByAccountBookId,
  useGetFlowRecordTotalAmountPerTraderByAccountBookId,
} from '@/graphql/accountBookStatistics';

export type AmountCardProps = {
  category?: Category;
  dateRange?: [Dayjs | null, Dayjs | null] | null;
};

const AmountCard: FC<AmountCardProps> = ({ category, dateRange }) => {
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

  return (
    <IndicatorCard
      title={name}
      tips={`月度${name}统计`}
      value={currentMonthAmount}
      footer={userDetails}
    >
      <Indicator
        title="同比上月"
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
