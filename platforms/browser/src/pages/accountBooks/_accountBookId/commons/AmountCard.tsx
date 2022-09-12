import { activeAccountBookAtom } from '@/store';
import { useAtom } from 'jotai';
import { FC, useMemo } from 'react';
import { TagType } from '@/types';
import dayjs from 'dayjs';
import useGetFlowRecordTotalAmount from '@/graphql/useGetFlowRecordTotalAmount';
import IndicatorCard from '@/components/IndicatorCard';
import Indicator from '@/components/Indicator';
import useGetFlowRecordTotalAmountPerTrader from '@/graphql/useGetFlowRecordTotalAmountPerTrader';

export type AmountCardProps = {
  type: TagType;
  title: string;
};

const AmountCard: FC<AmountCardProps> = ({ type, title }) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const dates = useMemo(() => {
    const day = dayjs();
    const lastMonth = day.add(-1, 'month');
    return [
      day.startOf('month').toISOString(),
      lastMonth.startOf('month').toISOString(),
      lastMonth.endOf('month').toISOString(),
    ];
  }, []);

  const { data: currentMonthData } = useGetFlowRecordTotalAmount({
    accountBookId: activeAccountBook!.id,
    tagType: type,
    startDate: dates[0],
  });

  const { data: lastMonthData } = useGetFlowRecordTotalAmount({
    accountBookId: activeAccountBook!.id,
    tagType: type,
    startDate: dates[1],
    endDate: dates[2],
  });

  const { data: totalAmountPerTraderData } =
    useGetFlowRecordTotalAmountPerTrader({
      accountBookId: activeAccountBook!.id,
      tagType: type,
      startDate: dates[0],
    });

  const currentMonthAmount = Math.abs(
    currentMonthData?.node.statistics.flowRecordTotalAmount || 0,
  );

  const lastMonthAmount = Math.abs(
    lastMonthData?.node.statistics.flowRecordTotalAmount || 0,
  );

  const userDetails = (
    <div className="flex items-center space-x-2 w-full overflow-auto h-6">
      {totalAmountPerTraderData?.node.statistics.flowRecordTotalAmountPerTrader.map(
        (it) => (
          <div key={it.trader.id}>
            {it.trader.nickname}: ￥ {it.amount.toLocaleString()}
          </div>
        ),
      )}
    </div>
  );

  return (
    <IndicatorCard
      title={title}
      tips={`月度${title}统计`}
      value={`￥ ${currentMonthAmount.toLocaleString()}`}
      footer={userDetails}
    >
      <Indicator
        title="同比上月"
        value={
          lastMonthAmount
            ? (currentMonthAmount - lastMonthAmount) / lastMonthAmount
            : undefined
        }
      />
    </IndicatorCard>
  );
};

export default AmountCard;
