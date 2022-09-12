import ReactEcharts, { EchartsOptions } from '@/components/ReactEcharts';
import useGetFlowRecordTotalAmountPerTraderGroupByDate from '@/graphql/useGetFlowRecordTotalAmountPerTraderGroupByDate';
import { activeAccountBookAtom } from '@/store';
import { DateGroupBy, TagType } from '@/types';
import { Empty } from 'antd';
import { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { FC, useMemo } from 'react';

export type FlowRecordTrendProps = {
  tagType: TagType;
  groupBy: DateGroupBy;
  dateRange?: [Dayjs | null, Dayjs | null] | null;
};

const FlowRecordTrend: FC<FlowRecordTrendProps> = ({
  tagType,
  groupBy,
  dateRange,
}) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const { data } = useGetFlowRecordTotalAmountPerTraderGroupByDate({
    accountBookId: activeAccountBook!.id,
    groupBy,
    tagType,
    startDate: dateRange?.[0]?.toISOString(),
    endDate: dateRange?.[1]?.toISOString(),
  });

  const dataset = useMemo(() => {
    const source =
      data?.node.statistics.flowRecordTotalAmountPerTraderGroupByDate || [];

    const header = source.map((it) => it.trader.nickname);

    const dateSet = new Set<string>();

    source.forEach((it) => {
      it.amountPerDate.forEach((it2) => {
        dateSet.add(it2.dealAt);
      });
    });

    const dates = Array.from(dateSet).sort((a, b) => (a > b ? 1 : -1));

    const all: Array<Array<any>> = [];

    dates.forEach((date) => {
      const array: Array<any> = [date];

      header.forEach((name) => {
        const dateAmount = source.find(
          (it) => it.trader.nickname === name,
        )!.amountPerDate;

        const amount = dateAmount.find((it) => it.dealAt === date)?.amount || 0;

        array.push(tagType === TagType.EXPENDITURE ? -amount : amount);
      });
      all.push(array);
    });

    all.unshift(['日期', ...header]);

    return all;
  }, [data, tagType]);

  const options = useMemo<EchartsOptions>(() => {
    const categories = dataset[0].slice(1) as Array<string>;
    return {
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
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      legend: {
        right: 0,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
      },
      dataset: {
        source: dataset,
      },
      series: categories.map((it) => ({
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series',
        },
      })),
    };
  }, [dataset]);

  const isEmpty = dataset.length < 2;

  return (
    <div className="w-full h-60 flex items-center justify-center">
      {isEmpty ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <ReactEcharts className="w-full h-full" options={options} />
      )}
    </div>
  );
};

export default FlowRecordTrend;
