import { Breadcrumb } from 'antd';
import clsx from 'clsx';
import { FC, HTMLAttributes, ReactNode } from 'react';

export type ContentProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  breadcrumbs?: Array<{ name: string; path?: string }>;
  children: ReactNode;
  action?: ReactNode;
  pagination?: ReactNode;
  contentClassName?: string;
};

const Content: FC<ContentProps> = ({
  title,
  breadcrumbs,
  children,
  action,
  pagination,
  className,
  contentClassName,
  ...others
}) => {
  return (
    <div {...others} className={clsx('w-full space-y-4', className)}>
      {breadcrumbs && (
        <Breadcrumb>
          {breadcrumbs.map((it, index) => (
            <Breadcrumb.Item href={it.path} key={index}>
              {it.name}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
      {(title || action) && (
        <div className="bg-white p-2 rounded flex flex-row items-center justify-between">
          {title && (
            <h1 className="leading-none m-0 font-bold text-lg">{title}</h1>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={clsx('bg-white p-2 rounded', contentClassName)}>
        {children}
      </div>
      {pagination && (
        <div className="p-2 rounded text-center md:text-right">
          {pagination}
        </div>
      )}
    </div>
  );
};

export default Content;
