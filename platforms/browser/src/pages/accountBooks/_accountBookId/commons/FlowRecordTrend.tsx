import ReactEcharts, { EchartsOptions } from '@/components/ReactEcharts';
import useGetFlowRecordTotalAmountPerTraderGroupByDate from '@/graphql/useGetFlowRecordTotalAmountPerTraderGroupByDate';
import { activeAccountBookAtom } from '@/store';
import { DateGroupBy, TagType } from '@/types';
import { Empty } from 'antd';
import { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { FC, useMemo } from 'react';
import * as echarts from 'echarts/core';

export type FlowRecordTrendProps = {
  tagType: TagType;
  groupBy: DateGroupBy;
  dateRange?: [Dayjs | null, Dayjs | null] | null;
};

const COLORS = [
  ['rgb(255, 191, 0)', 'rgb(224, 62, 76)'],
  ['rgb(255, 0, 135)', 'rgb(135, 0, 157)'],
  ['rgb(55, 162, 255)', 'rgb(116, 21, 219)'],
  ['rgb(0, 221, 255)', 'rgb(77, 119, 255)'],
  ['rgb(128, 255, 165)', 'rgb(1, 191, 236)'],
];

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
      color: COLORS.map((it) => it[0]),
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
      series: categories.map((it, index) => {
        const i = index % COLORS.length;

        return {
          type: 'line',
          stack: 'Total',
          smooth: true,
          emphasis: {
            focus: 'series',
          },
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: COLORS[i][0],
              },
              {
                offset: 1,
                color: COLORS[i][1],
              },
            ]),
          },
        };
      }),
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
