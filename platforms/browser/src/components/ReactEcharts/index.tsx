import {
  useEffect,
  useRef,
  HTMLAttributes,
  forwardRef,
  useImperativeHandle,
} from 'react';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import {
  BarChart,
  BarSeriesOption,
  LineChart,
  LineSeriesOption,
  PieChart,
  PieSeriesOption,
} from 'echarts/charts';
import {
  TooltipComponent,
  TooltipComponentOption,
  DatasetComponent,
  DatasetComponentOption,
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption,
} from 'echarts/components';
import { COLORS } from '@/utils/constants';

echarts.use([
  CanvasRenderer,
  LabelLayout,
  UniversalTransition,
  LegendComponent,
  TooltipComponent,
  DatasetComponent,
  GridComponent,
  BarChart,
  LineChart,
  PieChart,
]);

export type EchartsOptions = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | LegendComponentOption
  | TooltipComponentOption
  | DatasetComponentOption
  | GridComponentOption
>;

export type EchartsProps = HTMLAttributes<HTMLDivElement> & {
  options: EchartsOptions;
  instanceInterceptor?: (instance: echarts.ECharts) => () => void;
};

const ReactEcharts = forwardRef<{ echarts?: echarts.ECharts }, EchartsProps>(
  ({ options, instanceInterceptor, ...others }, ref) => {
    const domRef = useRef<HTMLDivElement>(null);

    const echartInstance = useRef<echarts.ECharts>();

    useImperativeHandle(ref, () => {
      return {
        echarts: echartInstance.current,
      };
    });

    useEffect(() => {
      if (!domRef.current) {
        return;
      }
      const instance = echarts.init(domRef.current, {
        color: COLORS.reduce((prev, cur) => {
          prev.push(...cur);
          return prev;
        }, []),
      });

      echartInstance.current = instance;

      const cancel = instanceInterceptor?.(instance);

      const handleResize = () => {
        instance.resize();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        cancel?.();
        instance.dispose();
        echartInstance.current = undefined;
      };
    }, [instanceInterceptor]);

    useEffect(() => {
      const instance = echartInstance.current;
      if (instance) {
        instance.setOption(options);
      }
    }, [options]);

    return <div className="w-full h-full" {...others} ref={domRef}></div>;
  },
);

export default ReactEcharts;
