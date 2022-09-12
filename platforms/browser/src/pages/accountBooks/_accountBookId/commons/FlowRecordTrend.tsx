import ReactEcharts, { EchartsOptions } from '@/components/ReactEcharts';
import useGetFlowRecordTotalAmountPerTraderGroupByDate from '@/graphql/useGetFlowRecordTotalAmountPerTraderGroupByDate';
import { activeAccountBookAtom } from '@/store';
import { DateGroupBy, TagType } from '@/types';
import { useAtom } from 'jotai';
import { FC, useMemo } from 'react';

export type FlowRecordTrendProps = {
  tagType: TagType;
  groupBy: DateGroupBy;
};

const FlowRecordTrend: FC<FlowRecordTrendProps> = ({ tagType, groupBy }) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const { data } = useGetFlowRecordTotalAmountPerTraderGroupByDate({
    accountBookId: activeAccountBook!.id,
    groupBy,
    tagType,
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

    const dates = Array.from(dateSet).sort((a, b) => (a < b ? 1 : -1));

    const all: Array<Array<any>> = [];

    dates.forEach((date) => {
      const array: Array<any> = [date];

      header.forEach((name) => {
        const dateAmount = source.find(
          (it) => it.trader.nickname === name,
        )!.amountPerDate;

        const amount =
          dateAmount.find((it) => it.dealAt === date)?.amount || null;

        array.push(
          tagType === TagType.EXPENDITURE
            ? amount
              ? -amount
              : amount
            : amount,
        );
      });
      all.push(array);
    });

    all.unshift(['日期', ...header]);

    return all;
  }, [data, tagType]);

  const options = useMemo<EchartsOptions>(() => {
    return {
      tooltip: {},
      legend: {},
      xAxis: {
        type: 'category',
      },
      yAxis: {
        type: 'value',
      },
      dataset: {
        source: dataset,
      },
      series: dataset[0].slice(1).map((it) => ({
        type: 'line',
        connectNulls: true,
        smooth: true,
      })),
    };
  }, [dataset]);

  return (
    <div className="w-full h-52">
      <ReactEcharts className="w-full h-full" options={options} />
    </div>
  );
};

export default FlowRecordTrend;
