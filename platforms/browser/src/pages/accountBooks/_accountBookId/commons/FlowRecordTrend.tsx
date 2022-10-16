import ReactEcharts, { EchartsOptions } from '@/components/ReactEcharts';
import { useGetFlowRecordTotalAmountPerTraderGroupByDateByAccountBookId } from '@/graphql/accountBookStatistics';
import { activeAccountBookAtom } from '@/store';
import { Category, CategoryType, DateGroupBy } from '@/types';
import { Empty } from 'antd';
import { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { FC, useMemo } from 'react';
// import * as echarts from 'echarts/core';

export type FlowRecordTrendProps = {
  category?: Category;
  categoryType?: CategoryType;
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
  category,
  groupBy,
  dateRange,
  categoryType,
}) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const { data } =
    useGetFlowRecordTotalAmountPerTraderGroupByDateByAccountBookId({
      accountBookId: activeAccountBook!.id,
      groupBy,
      filter: {
        categoryType,
        categoryId: category?.id,
        startDate: dateRange?.[0]?.toISOString(),
        endDate: dateRange?.[1]?.toISOString(),
      },
    });

  const singleDataset = useMemo(() => {
    const source = data || [];

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

        array.push(
          (category?.type || categoryType) === CategoryType.NEGATIVE_AMOUNT
            ? -amount
            : amount,
        );
      });
      all.push(array);
    });

    all.unshift(['日期', ...header]);

    return all;
  }, [data, category, categoryType]);

  const sumDataset = useMemo(() => {
    const all: Array<Array<any>> = [];

    singleDataset.forEach((row, i) => {
      if (i === 0) {
        all.push(row);
        return;
      }
      const array: Array<any> = [];

      row.forEach((col, j) => {
        if (j === 0) {
          array.push(col);
          return;
        }
        array.push(i > 1 ? all[i - 1][j] + col : col);
      });
      all.push(array);
    });

    return all;
  }, [singleDataset]);

  const options = useMemo<EchartsOptions>(() => {
    const categories = singleDataset[0].slice(1) as Array<string>;
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
      dataset: [
        {
          source: singleDataset,
        },
        {
          source: sumDataset,
        },
      ],
      series: [
        ...categories.map((it, index) => {
          // const i = index % COLORS.length;

          return {
            datasetIndex: 0,
            type: 'bar',
            emphasis: {
              focus: 'series',
            },
          };
        }),
        ...categories.map((it, index) => {
          // const i = index % COLORS.length;

          return {
            datasetIndex: 1,
            type: 'line',
            smooth: true,
            stack: 'Total',
            stackStrategy: 'all',
            emphasis: {
              focus: 'series',
            },
          };
        }),
      ],
    };
  }, [singleDataset, sumDataset]);

  const isEmpty = singleDataset.length < 2;

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
