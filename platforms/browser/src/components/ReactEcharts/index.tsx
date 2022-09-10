import { useEffect, useRef, HTMLAttributes, FC } from 'react';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import {
  BarChart,
  BarSeriesOption,
  LineChart,
  LineSeriesOption,
} from 'echarts/charts';
import {
  TooltipComponent,
  TooltipComponentOption,
  DatasetComponent,
  DatasetComponentOption,
  GridComponent,
  GridComponentOption,
} from 'echarts/components';

echarts.use([
  CanvasRenderer,
  LabelLayout,
  UniversalTransition,
  TooltipComponent,
  DatasetComponent,
  GridComponent,
  BarChart,
  LineChart,
]);

export type EchartsOptions = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | TooltipComponentOption
  | DatasetComponentOption
  | GridComponentOption
>;

export type EchartsProps = HTMLAttributes<HTMLDivElement> & {
  options: EchartsOptions;
};

const ReactEcharts: FC<EchartsProps> = ({ options, ...others }) => {
  const ref = useRef<HTMLDivElement>(null);

  const echartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const instance = echarts.init(ref.current);

    echartInstance.current = instance;

    const handleResize = () => {
      instance.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      instance.dispose();
      echartInstance.current = undefined;
    };
  }, []);

  useEffect(() => {
    const instance = echartInstance.current;
    if (instance) {
      instance.setOption(options);
    }
  }, [options]);

  return <div className="w-full h-full" {...others} ref={ref}></div>;
};

export default ReactEcharts;
