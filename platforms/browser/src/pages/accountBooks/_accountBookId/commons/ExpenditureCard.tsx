import { activeAccountBookAtom } from '@/store';
import { Card } from 'antd';
import { useAtom } from 'jotai';
import { FC, useMemo, useState } from 'react';
import { DateGroupBy, TagType } from '@/types';
import dayjs from 'dayjs';
import ReactEcharts, { EchartsOptions } from '@/components/ReactEcharts';
import useGetFlowRecordAmountInfo from '@/graphql/useGetFlowRecordAmountInfo';

export type ExpenditureCardProps = {
  tagType: TagType;
  title: string;
};

const ExpenditureCard: FC<ExpenditureCardProps> = ({ tagType, title }) => {
  const [groupBy, setGroupBy] = useState<DateGroupBy>('DAY');

  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const startDate = useMemo(() => {
    const day = dayjs();
    switch (groupBy) {
      case 'YEAR': {
        return [day.format('YYYY-01-01'), undefined];
      }
      case 'MONTH': {
        return [day.format('YYYY-MM-01'), day.format('YYYY-01-01')];
      }
      case 'DAY': {
        return [day.format('YYYY-MM-DD'), day.format('YYYY-MM-01')];
      }
    }
  }, [groupBy]);

  const { data } = useGetFlowRecordAmountInfo({
    accountBookId: activeAccountBook!.id,
    tagType,
    startDateForAmount: startDate[0],
    startDateForAmounts: startDate[1],
    groupBy,
  });

  const amount = Math.abs(data?.node.totalFlowRecordAmount || 0);

  const echartsOptios = useMemo<EchartsOptions>(() => {
    const amountList =
      data?.node.totalFlowRecordAmounts.map((it) => [
        it.dealAt,
        Math.abs(it.amount),
      ]) || [];

    return {
      tooltip: {},
      xAxis: {
        type: 'time',
        name: '时间',
      },
      yAxis: {
        type: 'value',
        name: '金额',
      },
      series: [
        {
          type: 'line',
        },
      ],
      dataset: {
        source: amountList,
      },
    };
  }, [data]);

  return (
    <Card title={title}>
      <div>￥{amount}</div>
      <div style={{ height: 200, width: 500 }}>
        <ReactEcharts options={echartsOptios} />
      </div>
    </Card>
  );
};

export default ExpenditureCard;
