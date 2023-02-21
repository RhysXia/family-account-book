import { ReactNode } from 'react';

export type RenderProps<T = any> = {
  value: T;
  onChange: (value: T) => void;
  index: number;
  isEdit: boolean;
};

export type Render = (data: RenderProps) => ReactNode;

export type Column = {
  title: string;
  style?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  className?: string;
  headerClassName?: string;
  render?: Render;
  dataIndex?: string;
};
