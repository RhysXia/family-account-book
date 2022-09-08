import { Breadcrumb } from 'antd';
import { FC, ReactNode } from 'react';

export type ContentProps = {
  title: string;
  breadcrumbs: Array<{ name: string; path?: string }>;
  children: ReactNode;
  action?: ReactNode;
};

const Content: FC<ContentProps> = ({
  title,
  breadcrumbs,
  children,
  action,
}) => {
  return (
    <div className="w-full space-y-4">
      <Breadcrumb>
        {breadcrumbs.map((it, index) => (
          <Breadcrumb.Item href={it.path} key={index}>
            {it.name}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
      <div className="bg-white p-2 rounded flex flex-row items-center justify-between">
        <h1 className="leading-none m-0 font-bold text-lg">{title}</h1>
        {action && <div>{action}</div>}
      </div>
      <div className="bg-white p-2 rounded">{children}</div>
    </div>
  );
};

export default Content;
