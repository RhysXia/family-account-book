import ReactEcharts, { EchartsOptions } from '@/components/ReactEcharts';
import { useGetFlowRecordTotalAmountPerTraderGroupByDateByAccountBookId } from '@/graphql/accountBookStatistics';
import { activeAccountBookAtom } from '@/store';
import { Category, CategoryType, DateGroupBy } from '@/types';
import { Empty } from 'antd';
import { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { FC, useMemo } from 'react';

export type FlowRecordTrendProps = {
  category?: Category;
  groupBy: DateGroupBy;
  dateRange?: [Dayjs | null, Dayjs | null] | null;
  enableStack?: boolean;
};

const FlowRecordTrend: FC<FlowRecordTrendProps> = ({
  category,
  groupBy,
  dateRange,
  enableStack,
}) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const { data } =
    useGetFlowRecordTotalAmountPerTraderGroupByDateByAccountBookId({
      accountBookId: activeAccountBook!.id,
      groupBy,
      filter: {
        categoryId: category?.id,
        startDate: dateRange?.[0]?.toISOString(),
        endDate: dateRange?.[1]?.toISOString(),
      },
    });

  const dataset = useMemo(() => {
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

    let prevArray: Array<any> | undefined;

    dates.forEach((date) => {
      const array: Array<any> = [date];

      header.forEach((name, index) => {
        const dateAmount = source.find(
          (it) => it.trader.nickname === name,
        )!.amountPerDate;

        let amount = absAmount(
          dateAmount.find((it) => it.dealAt === date)?.amount || 0,
          category?.type,
        );

        if (enableStack) {
          const prevAmount = prevArray?.[index + 1] || 0;

          amount += prevAmount;
        }

        array.push(amount);
      });

      all.push(array);
      prevArray = array;
    });

    all.unshift(['日期', ...header]);

    return all;
  }, [data, category, enableStack]);

  const options = useMemo<EchartsOptions>(() => {
    const categories = dataset[0].slice(1) as Array<string>;
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
      xAxis: {
        type: 'category',
        // boundaryGap: false,
      },
      yAxis: {
        type: 'value',
      },
      dataset: {
        source: dataset,
      },

      series: categories.map((it, index) => {
        // const i = index % COLORS.length;

        return enableStack
          ? {
              type: 'line',
              // stack: 'Total',
              // stackStrategy: 'all',
              smooth: true,
              emphasis: {
                focus: 'series',
              },
            }
          : {
              type: 'bar',
              barMaxWidth: 50,
              // stack: 'Total',
              // stackStrategy: 'all',
              emphasis: {
                focus: 'series',
              },
            };
      }),
    };
  }, [dataset, enableStack]);

  const isEmpty = dataset.length < 2;

  return (
    <div className="w-full h-60 flex items-center justify-center">
      {isEmpty ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <ReactEcharts options={options} />
      )}
    </div>
  );
};

export default FlowRecordTrend;

const absAmount = (amount: number, type?: CategoryType) =>
  type === CategoryType.EXPENDITURE ? -amount : amount;
