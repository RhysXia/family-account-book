import { Empty } from 'antd';
import {
  TooltipFormatterCallback,
  TopLevelFormatterParams,
} from 'echarts/types/dist/shared';
import { FC, useMemo } from 'react';
import ReactEcharts, { EchartsOptions } from '../ReactEcharts';

export type FlowRecordPieProps = {
  title: string;
  data: Array<{ name: string; value: number }>;
};

const FlowRecordPie: FC<FlowRecordPieProps> = ({ title, data }) => {
  const options = useMemo<EchartsOptions>(() => {
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
          name: title,
          type: 'pie',
          radius: '80%',
          label: {
            show: false,
          },
          data: data.map((it) => ({
            value: Math.abs(it.value),
            name: it.name,
          })),
        },
      ],
    };
  }, [data, title]);

  const isEmpty = !data || data.length === 0;
  return (
    <div className="w-full h-full flex justify-center items-center">
      {isEmpty ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <ReactEcharts className="w-full h-full" options={options} />
      )}
    </div>
  );
};

export default FlowRecordPie;
