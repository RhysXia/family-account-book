import useConstantFn from '@/hooks/useConstanFn';
import { Input } from 'antd';
import { FC, ReactNode } from 'react';

export type RenderProps<T = any> = {
  value: T;
  onChange: (value: T) => void;
  index: number;
  isEdit: boolean;
};

export type Render = (data: RenderProps) => ReactNode;

export type Column = {
  title: string;
  width?: number;
  render?: Render;
  dataIndex?: string;
  key?: string;
};

export type CellProps = {
  column: Column;
  row: any;
  isEdit: boolean;
  onEdit: () => void;
  onChange: (value: any) => void;
  index: number;
};

const DEFAULT_RENDER: Render = ({ value, onChange, isEdit }) => {
  if (isEdit) {
    return <Input value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  return <span>{value}</span>;
};

const Cell: FC<CellProps> = ({
  row,
  column,
  isEdit,
  index,
  onChange,
  onEdit,
}) => {
  const { width, dataIndex, render = DEFAULT_RENDER } = column;

  const handleValueChange = useConstantFn((v: any) => {
    if (isEdit) {
      const data = dataIndex === undefined ? v : { ...row, [dataIndex]: v };
      onChange(data);
    }
  });

  const value = dataIndex === undefined ? row : row[dataIndex];

  return (
    <div className="table-cell p-2" style={{ width }} onDoubleClick={onEdit}>
      {render({ value, onChange: handleValueChange, isEdit, index })}
    </div>
  );
};

export default Cell;
