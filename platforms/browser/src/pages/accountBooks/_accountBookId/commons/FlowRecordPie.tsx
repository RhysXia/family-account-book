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
import {
  TooltipFormatterCallback,
  TopLevelFormatterParams,
} from 'echarts/types/dist/shared';

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
      startDealAt: dateRange?.[0]?.toISOString(),
      endDealAt: dateRange?.[1]?.toISOString(),
    },
  });

  const options = useMemo<EchartsOptions>(() => {
    const list = data || [];

    const formatter: TooltipFormatterCallback<TopLevelFormatterParams> = (
      params,
    ) => {
      if (Array.isArray(params)) {
        return '';
      }
      const { name, value, percent } = params;
      return `${name} : ${value.toLocaleString('zh-CN', {
        style: 'currency',
        currency: 'CNY',
      })} (${percent}%)`;
    };

    return {
      grid: {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
      },
      tooltip: {
        trigger: 'item',
        formatter,
        confine: true,
      },
      legend: {
        orient: 'vertical',
        right: 0,
      },
      series: [
        {
          name: CategoryTypeInfoMap[categoryType].text,
          type: 'pie',
          radius: '80%',
          label: {
            show: false,
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
