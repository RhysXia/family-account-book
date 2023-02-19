import { Empty } from 'antd';
import clsx from 'clsx';
import {
  TooltipFormatterCallback,
  TopLevelFormatterParams,
} from 'echarts/types/dist/shared';
import { FC, HTMLAttributes, useMemo } from 'react';
import ReactEcharts, { EchartsOptions, EchartsProps } from '../ReactEcharts';

export type FlowRecordPieProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  data?: Array<{ id?: string; name: string; value: number }>;
  instanceInterceptor?: EchartsProps['instanceInterceptor'];
};

const FlowRecordPie: FC<FlowRecordPieProps> = ({
  title,
  data,
  className,
  instanceInterceptor,
  ...others
}) => {
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
        orient: 'horizontal',
        right: 0,
        width: '100%',
      },
      series: [
        {
          top: 20,
          name: title,
          type: 'pie',
          radius: '80%',
          label: {
            show: false,
          },
          data: list.map((it) => ({
            id: it.id,
            value: Math.abs(it.value),
            name: it.name,
          })),
        },
      ],
    };
  }, [data, title]);

  const isEmpty = !data || data.length === 0;
  return (
    <div
      {...others}
      className={clsx(
        'w-full h-full flex justify-center items-center',
        className,
      )}
    >
      {isEmpty ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <ReactEcharts
          className="w-full h-full"
          options={options}
          instanceInterceptor={instanceInterceptor}
        />
      )}
    </div>
  );
};

export default FlowRecordPie;
