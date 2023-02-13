import { activeAccountBookAtom } from '@/store';
import { useAtom } from 'jotai';
import { FC, useMemo } from 'react';
import { Dayjs } from 'dayjs';
import { CategoryType, DateGroupBy } from '@/types';
import { useGetFlowRecordTotalAmountPerCategoryByAccountBookId } from '@/graphql/accountBookStatistics';
import Card from '@/components/Card';
import { CategoryTypeInfoMap } from '@/utils/constants';
import ReactEcharts, { EchartsOptions } from '@/components/ReactEcharts';
import { Empty } from 'antd';

export type AmountCardProps = {
  categoryType: CategoryType;
  dateRange?: [Dayjs | null, Dayjs | null] | null;
  groupBy: DateGroupBy;
};

const FlowRecordPie: FC<AmountCardProps> = ({
  categoryType,
  dateRange,
  groupBy,
}) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const { data } = useGetFlowRecordTotalAmountPerCategoryByAccountBookId({
    accountBookId: activeAccountBook!.id,
    filter: {
      categoryType,
      startDate: dateRange?.[0]?.toISOString(),
      endDate: dateRange?.[1]?.toISOString(),
    },
  });

  const options = useMemo<EchartsOptions>(() => {
    const list = data || [];

    return {
      // color: COLORS.map((it) => it[0]),
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
      },
      grid: {
        left: 20,
        right: 40,
        bottom: 20,
        top: 30,
        containLabel: true,
      },
      legend: {
        right: 0,
      },
      series: [
        {
          name: CategoryTypeInfoMap[categoryType].text,
          type: 'pie',
          radius: '50%',
          data: list.map((it) => ({
            value: it.amount,
            name: it.category.name,
          })),
        },
      ],
    };
  }, [data, categoryType]);

  const isEmpty = !data || data.length === 0;

  return (
    <Card title={CategoryTypeInfoMap[categoryType].text}>
      {isEmpty ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <ReactEcharts className="w-full h-full" options={options} />
      )}
    </Card>
  );
};

export default FlowRecordPie;
