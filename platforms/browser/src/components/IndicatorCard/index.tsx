import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { FC, ReactNode } from 'react';

export type IndicatorCardProps = {
  title: string;
  tips?: string;
  action?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  value: number;
};

const IndicatorCard: FC<IndicatorCardProps> = ({
  title,
  tips,
  action,
  children,
  footer,
  value,
}) => {
  action =
    action ||
    (tips && (
      <Tooltip title={tips}>
        <ExclamationCircleOutlined className="cursor-pointer" />
      </Tooltip>
    ));

  return (
    <div className="bg-white w-full hover:shadow rounded p-4">
      <div className="text-gray-500 flex items-center justify-between">
        <div>{title}</div>
        {action && <div>{action}</div>}
      </div>
      <div className="text-3xl text-ellipsis overflow-hidden whitespace-nowrap mt-2 mb-3">
        <span>
          {value.toLocaleString('zh-CN', {
            style: 'currency',
            currency: 'CNY',
          })}
        </span>
      </div>
      <div>{children}</div>
      {footer && (
        <div className="border-t border-gray-200 pt-3 mt-3">{footer}</div>
      )}
    </div>
  );
};

export default IndicatorCard;
