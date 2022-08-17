import { FC, ReactNode } from 'react';

export type ContentProps = {
  title: string;
  breadcrumbs: ReactNode;
  children: ReactNode;
};

const Content: FC<ContentProps> = ({ title, breadcrumbs, children }) => {
  return <div>{children}</div>;
};

export default Content;
