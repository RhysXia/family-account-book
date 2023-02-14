import { activeAccountBookAtom } from '@/store';
import { useAtom } from 'jotai';
import { FC, useMemo } from 'react';
import { Dayjs } from 'dayjs';
import { CategoryType } from '@/types';
import { useGetFlowRecordTotalAmountPerCategoryByAccountBookId } from '@/graphql/accountBookStatistics';
import Card from '@/components/Card';
import { CategoryTypeInfoMap } from '@/utils/constants';
import ReactEcharts, { EchartsOptions } from '@/components/ReactEcharts';
import { Empty } from 'antd';
import { LabelFormatterCallback } from 'echarts';
import { CallbackDataParams } from 'echarts/types/dist/shared';

export type AmountCardProps = {
  categoryType: CategoryType;
  dateRange?: [Dayjs | null, Dayjs | null] | null;
};

const FlowRecordPie: FC<AmountCardProps> = ({ categoryType, dateRange }) => {
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

    const formatter: LabelFormatterCallback<CallbackDataParams> = ({
      name,
      value,
      percent,
    }) =>
      `${name} : ${value.toLocaleString('zh-CN', {
        style: 'currency',
        currency: 'CNY',
      })} (${percent}%)`;

    return {
      grid: {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
      },
      legend: {
        orient: 'vertical',
        right: 0,
      },
      series: [
        {
          name: CategoryTypeInfoMap[categoryType].text,
          type: 'pie',
          label: {
            show: true,
            formatter,
          },
          labelLine: {
            show: true,
          },
          data: list.map((it) => ({
            value: Math.abs(it.amount),
            name: it.category.name,
          })),
        },
      ],
    };
  }, [data, categoryType]);

  const isEmpty = !data || data.length === 0;

  return (
    <Card
      className="w-full h-full"
      title={CategoryTypeInfoMap[categoryType].text}
    >
      <div className="w-full h-full flex justify-center items-center">
        {isEmpty ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <ReactEcharts className="w-full h-full" options={options} />
        )}
      </div>
    </Card>
  );
};

export default FlowRecordPie;
