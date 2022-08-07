import clsx from 'clsx';
import { FC, ReactNode } from 'react';

export type DashboardActionProps = {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
  showSpace?: boolean;
};

const DashboardAction: FC<DashboardActionProps> = ({
  children,
  title,
  actions,
  showSpace,
}) => {
  const bodyClasses = clsx('flex-1', {
    'px-3 py-3': showSpace,
  });

  return (
    <div className="flex flex-col">
      <div className="flex flex-row border-b border-gray-100 px-3 py-3 items-center justify-between">
        <h1 className="font-bold text-lg leading-none m-0 p-0">{title}</h1>
        {actions && (
          <div className="flex items-center space-x-2">{actions}</div>
        )}
      </div>
      <div className={bodyClasses}>{children}</div>
    </div>
  );
};

export default DashboardAction;
