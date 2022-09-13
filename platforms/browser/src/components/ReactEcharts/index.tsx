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
]);

export type EchartsOptions = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | LegendComponentOption
  | TooltipComponentOption
  | DatasetComponentOption
  | GridComponentOption
>;

export type EchartsProps = HTMLAttributes<HTMLDivElement> & {
  options: EchartsOptions;
};

const ReactEcharts = forwardRef<{ echarts?: echarts.ECharts }, EchartsProps>(
  ({ options, ...others }, ref) => {
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
      const instance = echarts.init(domRef.current);

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

    return <div className="w-full h-full" {...others} ref={domRef}></div>;
  },
);

export default ReactEcharts;
