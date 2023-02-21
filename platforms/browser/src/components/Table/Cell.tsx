import useConstantFn from '@/hooks/useConstanFn';
import { Input } from 'antd';
import { FC } from 'react';
import clsx from 'clsx';
import { getProp, mergeProp } from './utils';
import { Column, Render } from './type';

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
  const { style, dataIndex, render = DEFAULT_RENDER, className } = column;

  const handleValueChange = useConstantFn((v: any) => {
    if (isEdit) {
      const data = mergeProp(row, v, dataIndex);
      onChange(data);
    }
  });

  const value = getProp(row, dataIndex);

  const classes = clsx('table-cell', 'p-2', className);

  return (
    <div className={classes} style={style} onDoubleClick={onEdit}>
      {render({ value, onChange: handleValueChange, isEdit, index })}
    </div>
  );
};

export default Cell;
