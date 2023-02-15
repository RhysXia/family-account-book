import { CaretDownFilled, CaretUpFilled } from '@ant-design/icons';
import { FC, ReactNode } from 'react';

export type IndicatorProps = {
  title: string;
  value?: number;
};

const Indicator: FC<IndicatorProps> = ({ title, value }) => {
  let icon: ReactNode;

  if (value) {
    if (value > 0) {
      icon = <CaretUpFilled className="text-red-600" />;
    } else {
      icon = <CaretDownFilled className="text-green-600" />;
    }
  }

  return (
    <span className="flex items-center">
      <span>{title}</span>
      <span className="px-2">
        {value === undefined ? '-' : (Math.abs(value) * 100).toFixed(2) + '%'}
      </span>
      {icon}
    </span>
  );
};

export default Indicator;
